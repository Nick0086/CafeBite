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
    const [searchQuery, setSearchQuery] = useState(''); // Text search in discovered list
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
    const [hideDuplicates, setHideDuplicates] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState({});
    const [discoveryData, setDiscoveryData] = useState(null);
    const [previewLead, setPreviewLead] = useState(null); // Lead currently opened in side drawer

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
        setPreviewLead(null);
        const isCoords = locationInput && /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(locationInput.trim());
        scanMutation.mutate({
            locationQuery: locationInput,
            lat: isCoords ? centerCoords.lat : undefined,
            lng: isCoords ? centerCoords.lng : undefined,
            radiusMeters: selectedRadius,
        });
    };

    const handleLocationPresetClick = (loc) => {
        setLocationInput(loc.label);
        setCenterCoords({ lat: loc.lat, lng: loc.lng });
        setPreviewLead(null);
        scanMutation.mutate({
            locationQuery: loc.label,
            lat: loc.lat,
            lng: loc.lng,
            radiusMeters: selectedRadius,
        });
    };

    const allLeads = discoveryData?.leads || [];
    const newLeadsOnly = allLeads.filter((l) => l.duplicateStatus === 'NEW');

    const filteredLeads = allLeads.filter((lead) => {
        if (hideDuplicates && lead.duplicateStatus !== 'NEW') return false;
        if (activeTab === 'new' && lead.duplicateStatus !== 'NEW') return false;
        if (activeTab === 'duplicates' && lead.duplicateStatus === 'NEW') return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const name = (lead.restaurant_name || '').toLowerCase();
            const city = (lead.city || lead.address || '').toLowerCase();
            const cuisine = (lead.cuisine || '').toLowerCase();
            const phone = (lead.phone || '').toLowerCase();
            return name.includes(q) || city.includes(q) || cuisine.includes(q) || phone.includes(q);
        }
        return true;
    });

    const selectedLeadObjects = allLeads.filter((l) => selectedLeads[l.osm_id]);

    const handleToggleSelectAllNew = () => {
        const newSelected = { ...selectedLeads };
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

    const handleSelectAllFiltered = () => {
        const newSelected = {};
        filteredLeads.forEach((l) => {
            newSelected[l.osm_id] = true;
        });
        setSelectedLeads(newSelected);
    };

    const handleDeselectAll = () => {
        setSelectedLeads({});
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

    const handleImportOnlyNewLeads = () => {
        if (newLeadsOnly.length === 0) {
            toastError('No verified new leads available to import');
            return;
        }
        importMutation.mutate(newLeadsOnly);
    };

    const handleImportSingleLead = (lead) => {
        if (!lead) return;
        importMutation.mutate([lead]);
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
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        hideDuplicates,
        setHideDuplicates,
        selectedLeads,
        previewLead,
        setPreviewLead,
        discoveryData,
        allLeads,
        newLeadsOnly,
        filteredLeads,
        selectedLeadObjects,
        scanMutation,
        importMutation,
        handleSearchScan,
        handleLocationPresetClick,
        handleToggleSelectAllNew,
        handleSelectAllFiltered,
        handleDeselectAll,
        handleToggleLead,
        handleBulkImport,
        handleImportOnlyNewLeads,
        handleImportSingleLead,
    };
}
