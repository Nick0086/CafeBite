import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discoverAdminLeads, bulkImportAdminLeads } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

export function useLeadDiscovery({ onImportSuccess } = {}) {
    const queryClient = useQueryClient();

    const [locationInput, setLocationInput] = useState('Navrangpura, Ahmedabad');
    const [selectedRadius, setSelectedRadius] = useState(500);
    const [centerCoords, setCenterCoords] = useState({ lat: 23.0333, lng: 72.5647 });
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'new' | 'duplicates'
    const [hideDuplicates, setHideDuplicates] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState({});
    const [discoveryData, setDiscoveryData] = useState(null);

    const scanMutation = useMutation({
        mutationFn: (params) => discoverAdminLeads(params),
        onSuccess: (res) => {
            const data = res?.data || {};
            setDiscoveryData(data);
            if (data.center) {
                setCenterCoords({ lat: data.center.lat, lng: data.center.lng });
            }
            // Auto-select all NEW verified leads by default
            const initialSelected = {};
            (data.leads || []).forEach((lead) => {
                if (lead.duplicateStatus === 'NEW') {
                    initialSelected[lead.osm_id] = true;
                }
            });
            setSelectedLeads(initialSelected);

            if (data.totalDiscovered === 0) {
                toastError('No POIs found in this radius. Try selecting a larger radius (e.g., 1km or 2km).');
            } else {
                toastSuccess(`Discovered ${data.totalDiscovered} places (${data.newCount} new leads)`);
            }
        },
        onError: (err) => {
            toastError(err.message || 'Failed to scan radius for leads. Please try again.');
        },
    });

    const importMutation = useMutation({
        mutationFn: (leads) => bulkImportAdminLeads(leads),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            toastSuccess(res.message || 'Successfully imported leads into CRM!');
            if (onImportSuccess) onImportSuccess();
        },
        onError: (err) => {
            toastError(err.message || 'Failed to import selected leads');
        },
    });

    const handleSearchScan = () => {
        scanMutation.mutate({
            locationQuery: locationInput,
            lat: centerCoords.lat,
            lng: centerCoords.lng,
            radiusMeters: selectedRadius,
        });
    };

    const handleLocationPresetClick = (loc) => {
        setLocationInput(loc.label);
        setCenterCoords({ lat: loc.lat, lng: loc.lng });
        scanMutation.mutate({
            locationQuery: loc.label,
            lat: loc.lat,
            lng: loc.lng,
            radiusMeters: selectedRadius,
        });
    };

    const allLeads = discoveryData?.leads || [];
    const filteredLeads = allLeads.filter((lead) => {
        if (hideDuplicates && lead.duplicateStatus !== 'NEW') return false;
        if (activeTab === 'new') return lead.duplicateStatus === 'NEW';
        if (activeTab === 'duplicates') return lead.duplicateStatus !== 'NEW';
        return true;
    });

    const selectedLeadObjects = allLeads.filter((l) => selectedLeads[l.osm_id]);

    const handleToggleSelectAllNew = () => {
        const newSelected = { ...selectedLeads };
        const newLeadsOnly = allLeads.filter((l) => l.duplicateStatus === 'NEW');
        const allNewAreSelected = newLeadsOnly.every((l) => newSelected[l.osm_id]);

        newLeadsOnly.forEach((l) => {
            if (allNewAreSelected) {
                delete newSelected[l.osm_id];
            } else {
                newSelected[l.osm_id] = true;
            }
        });
        setSelectedLeads(newSelected);
    };

    const handleToggleLead = (osm_id) => {
        setSelectedLeads((prev) => ({
            ...prev,
            [osm_id]: !prev[osm_id],
        }));
    };

    const handleBulkImport = () => {
        if (selectedLeadObjects.length === 0) {
            toastError('Please select at least one lead to import');
            return;
        }
        importMutation.mutate(selectedLeadObjects);
    };

    return {
        locationInput,
        setLocationInput,
        selectedRadius,
        setSelectedRadius,
        centerCoords,
        setCenterCoords,
        activeTab,
        setActiveTab,
        hideDuplicates,
        setHideDuplicates,
        selectedLeads,
        discoveryData,
        allLeads,
        filteredLeads,
        selectedLeadObjects,
        scanMutation,
        importMutation,
        handleSearchScan,
        handleLocationPresetClick,
        handleToggleSelectAllNew,
        handleToggleLead,
        handleBulkImport,
    };
}
