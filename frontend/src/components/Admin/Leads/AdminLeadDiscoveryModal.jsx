import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Radar,
    Search,
    MapPin,
    Building2,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    CheckSquare,
    Square,
    RefreshCw,
    X,
    Filter,
    Download,
    Sparkles,
    Globe,
    Phone,
    Sliders,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { discoverAdminLeads, bulkImportAdminLeads } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

const RADIUS_OPTIONS = [
    { label: '100m', value: 100 },
    { label: '250m', value: 250 },
    { label: '500m', value: 500 },
    { label: '1km',  value: 1000 },
    { label: '2km',  value: 2000 },
    { label: '5km',  value: 5000 },
];

const POPULAR_LOCATIONS = [
    { label: 'Navrangpura, Ahmedabad', lat: 23.0333, lng: 72.5647 },
    { label: 'SG Highway, Ahmedabad',  lat: 23.0500, lng: 72.5000 },
    { label: 'Alkapuri, Vadodara',     lat: 22.3072, lng: 73.1812 },
    { label: 'FC Road, Pune',          lat: 18.5204, lng: 73.8567 },
    { label: 'Marine Drive, Mumbai',   lat: 18.9438, lng: 72.8232 },
];

// Custom Leaflet marker icons configuration
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export function AdminLeadDiscoveryModal({ open, onClose }) {
    const queryClient = useQueryClient();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const circleLayerRef = useRef(null);
    const markerLayerGroupRef = useRef(null);

    const [locationInput, setLocationInput] = useState('Navrangpura, Ahmedabad');
    const [selectedRadius, setSelectedRadius] = useState(500);
    const [centerCoords, setCenterCoords] = useState({ lat: 23.0333, lng: 72.5647 });
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'new', 'duplicates'
    const [hideDuplicates, setHideDuplicates] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState({});

    const [discoveryData, setDiscoveryData] = useState(null);

    // ─── Scan Radius Mutation ───────────────────────────────────────────────────
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
            toastSuccess(`Discovered ${data.totalDiscovered} places (${data.newCount} new leads)`);
        },
        onError: (err) => {
            toastError(err.message || 'Failed to scan radius for leads');
        },
    });

    // ─── Bulk Import Mutation ──────────────────────────────────────────────────
    const importMutation = useMutation({
        mutationFn: (leads) => bulkImportAdminLeads(leads),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            toastSuccess(res.message || 'Successfully imported leads into CRM!');
            onClose();
        },
        onError: (err) => {
            toastError(err.message || 'Failed to import selected leads');
        },
    });

    // ─── Initialize / Update Leaflet Map ───────────────────────────────────────
    useEffect(() => {
        if (!open || !mapRef.current) return;

        // Initialize map instance if not already created
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [centerCoords.lat, centerCoords.lng],
                zoom: 15,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            markerLayerGroupRef.current = L.layerGroup().addTo(map);

            // Handle map click to re-center search
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                setCenterCoords({ lat, lng });
                setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            });

            mapInstanceRef.current = map;
        } else {
            mapInstanceRef.current.setView([centerCoords.lat, centerCoords.lng], 15);
        }

        // Render Radius Circle
        if (circleLayerRef.current) {
            mapInstanceRef.current.removeLayer(circleLayerRef.current);
        }

        circleLayerRef.current = L.circle([centerCoords.lat, centerCoords.lng], {
            color: '#6366f1',
            fillColor: '#818cf8',
            fillOpacity: 0.2,
            radius: selectedRadius,
        }).addTo(mapInstanceRef.current);

        // Clear and add markers for discovered leads
        if (markerLayerGroupRef.current) {
            markerLayerGroupRef.current.clearLayers();

            // Center Pin Marker
            L.marker([centerCoords.lat, centerCoords.lng], { icon: defaultIcon })
                .bindPopup(`<b>Target Center</b><br/>${locationInput}`)
                .addTo(markerLayerGroupRef.current);

            // Discovered Leads Markers
            if (discoveryData?.leads) {
                discoveryData.leads.forEach((lead) => {
                    if (lead.latitude && lead.longitude) {
                        const isDup = lead.duplicateStatus !== 'NEW';
                        const circleMarker = L.circleMarker([lead.latitude, lead.longitude], {
                            radius: 7,
                            color: isDup ? '#f43f5e' : '#10b981',
                            fillColor: isDup ? '#fb7185' : '#34d399',
                            fillOpacity: 0.8,
                        });

                        circleMarker.bindPopup(`
                            <div style="font-family: sans-serif; font-size: 12px;">
                                <b>${lead.restaurant_name}</b><br/>
                                <span style="color: #64748b;">${lead.cuisine || 'Restaurant'}</span><br/>
                                <span style="font-weight: bold; color: ${isDup ? '#e11d48' : '#059669'};">
                                    ${lead.duplicateStatus === 'NEW' ? '✓ Verified New Lead' : '⚠ ' + lead.duplicateStatus}
                                </span>
                            </div>
                        `);

                        circleMarker.addTo(markerLayerGroupRef.current);
                    }
                });
            }
        }
    }, [open, centerCoords, selectedRadius, discoveryData]);

    if (!open) return null;

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* ── Header ── */}
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                            <Radar className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg text-white">Auto Lead Finder Radar</h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    100% Free OSM API
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Enter location or drop a pin to scan surrounding restaurants &amp; cafes with automatic duplicate detection.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Main Scrollable Area ── */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 [scrollbar-width:thin]">

                    {/* ── Search & Filter Controls Bar ── */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <div className="relative flex-1">
                                <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Enter location (e.g., Navrangpura, Ahmedabad or CG Road)..."
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchScan()}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            {/* Radius Selector */}
                            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                                <Sliders className="w-3.5 h-3.5 text-indigo-400 ml-1.5 mr-0.5" />
                                {RADIUS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSelectedRadius(opt.value)}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                            selectedRadius === opt.value
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Scan Action Button */}
                            <button
                                onClick={handleSearchScan}
                                disabled={scanMutation.isPending}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                            >
                                {scanMutation.isPending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Scanning OSM...</span>
                                    </>
                                ) : (
                                    <>
                                        <Radar className="w-4 h-4" />
                                        <span>Scan Radius</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Popular location chip shortcuts */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
                            {POPULAR_LOCATIONS.map((loc) => (
                                <button
                                    key={loc.label}
                                    onClick={() => handleLocationPresetClick(loc)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 rounded-lg transition-colors cursor-pointer"
                                >
                                    📍 {loc.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Interactive Map View ── */}
                    <div className="relative border border-slate-800 rounded-xl overflow-hidden h-52 sm:h-64 shadow-inner">
                        <div ref={mapRef} className="w-full h-full z-10" />
                        <div className="absolute top-2 right-2 z-20 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Radius Center: ({centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)})</span>
                        </div>
                    </div>

                    {/* ── Scan Results Section ── */}
                    {discoveryData && (
                        <div className="space-y-3">
                            {/* Summary Metrics Strip */}
                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Total POIs Found</p>
                                        <h4 className="text-lg font-bold text-white mt-0.5">{discoveryData.totalDiscovered}</h4>
                                    </div>
                                    <Building2 className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-emerald-400 font-semibold uppercase">Verified New Leads</p>
                                        <h4 className="text-lg font-bold text-emerald-300 mt-0.5">{discoveryData.newCount}</h4>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-rose-400 font-semibold uppercase">CRM Duplicates</p>
                                        <h4 className="text-lg font-bold text-rose-300 mt-0.5">{discoveryData.duplicateCount}</h4>
                                    </div>
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                </div>
                            </div>

                            {/* Filter Bar & Batch Select Control */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                                <div className="flex items-center gap-1.5 overflow-x-auto">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                            activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                                        }`}
                                    >
                                        All ({discoveryData.totalDiscovered})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('new')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                            activeTab === 'new' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                                        }`}
                                    >
                                        New Leads ({discoveryData.newCount})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('duplicates')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                            activeTab === 'duplicates' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                                        }`}
                                    >
                                        Duplicates ({discoveryData.duplicateCount})
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={hideDuplicates}
                                            onChange={(e) => setHideDuplicates(e.target.checked)}
                                            className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer"
                                        />
                                        <span>Hide Duplicates</span>
                                    </label>
                                    <button
                                        onClick={handleToggleSelectAllNew}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        Select All New ({discoveryData.newCount})
                                    </button>
                                </div>
                            </div>

                            {/* Discovered Leads Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 [scrollbar-width:thin]">
                                {filteredLeads.map((lead) => {
                                    const isSelected = !!selectedLeads[lead.osm_id];
                                    const isNew = lead.duplicateStatus === 'NEW';
                                    const isDuplicate = lead.duplicateStatus === 'DUPLICATE';

                                    return (
                                        <div
                                            key={lead.osm_id}
                                            onClick={() => handleToggleLead(lead.osm_id)}
                                            className={`p-3.5 border rounded-xl space-y-2 cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-600/10'
                                                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <button className="mt-0.5 text-indigo-400 shrink-0">
                                                    {isSelected ? (
                                                        <CheckSquare className="w-4 h-4 text-indigo-400 fill-indigo-500/20" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-slate-600" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1.5">
                                                        <h4 className="font-bold text-sm text-slate-100 truncate">{lead.restaurant_name}</h4>
                                                        {isNew ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                New Lead
                                                            </span>
                                                        ) : (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                                                                isDuplicate
                                                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                                                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                                            }`}>
                                                                <AlertTriangle className="w-3 h-3" />
                                                                {lead.duplicateStatus}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                                                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
                                                            {lead.cuisine || 'Food & Dining'}
                                                        </span>
                                                        {lead.phone && (
                                                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                                                <Phone className="w-3 h-3" />
                                                                {lead.phone}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {lead.address && (
                                                        <p className="text-xs text-slate-400 truncate mt-1">
                                                            📍 {lead.address}
                                                        </p>
                                                    )}

                                                    {/* Duplicate match warning box */}
                                                    {!isNew && (
                                                        <div className="mt-2 text-[11px] bg-rose-950/40 border border-rose-900/50 text-rose-300 p-2 rounded-lg space-y-1">
                                                            <div className="flex items-center justify-between font-semibold">
                                                                <span>Duplicate Score: {lead.matchScore}%</span>
                                                            </div>
                                                            <p className="text-rose-400 text-[10px] line-clamp-1">{lead.matchReason}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
                    <div className="text-xs text-slate-400">
                        {selectedLeadObjects.length > 0 ? (
                            <span className="text-slate-200 font-semibold">
                                <span className="text-indigo-400 font-bold">{selectedLeadObjects.length}</span> lead{selectedLeadObjects.length !== 1 ? 's' : ''} selected for CRM import
                            </span>
                        ) : (
                            <span>Select verified leads to batch import</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkImport}
                            disabled={importMutation.isPending || selectedLeadObjects.length === 0}
                            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                        >
                            {importMutation.isPending ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Importing...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Import {selectedLeadObjects.length} Leads to CRM</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminLeadDiscoveryModal;
