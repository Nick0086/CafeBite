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
    Download,
    Sparkles,
    Phone,
    Sliders,
    Layers,
    Compass,
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

export function AdminLeadDiscoveryView({ onImportSuccess }) {
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

    // ─── Bulk Import Mutation ──────────────────────────────────────────────────
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

    // ─── Initialize / Update Leaflet Map ───────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map instance if not created
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
    }, [centerCoords, selectedRadius, discoveryData]);

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
        <div className="space-y-4 animate-in fade-in duration-200 pb-16 md:pb-4">
            
            {/* ── Search & Radius Control Bar (100% Mobile Optimized) ── */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xl">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3">
                    
                    {/* Location Input */}
                    <div className="relative flex-1">
                        <MapPin className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Enter area, street, or city (e.g. Navrangpura)..."
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchScan()}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                        />
                    </div>

                    {/* Radius selector (Horizontally Scrollable on Mobile) */}
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1.5 rounded-xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                        <Sliders className="w-4 h-4 text-indigo-400 ml-1.5 mr-1 shrink-0" />
                        {RADIUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedRadius(opt.value)}
                                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                    selectedRadius === opt.value
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Action Scan Button */}
                    <button
                        onClick={handleSearchScan}
                        disabled={scanMutation.isPending}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                        {scanMutation.isPending ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Scanning Radar...</span>
                            </>
                        ) : (
                            <>
                                <Radar className="w-4 h-4 animate-pulse" />
                                <span>Scan Radius</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Mobile Shortcuts */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">Quick Presets:</span>
                        {POPULAR_LOCATIONS.map((loc) => (
                            <button
                                key={loc.label}
                                onClick={() => handleLocationPresetClick(loc)}
                                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                                📍 {loc.label.split(',')[0]}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tap map to set pin</span>
                    </div>
                </div>
            </div>

            {/* ── Main 2-Column Responsive Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* ── Map Column (Responsive Height) ── */}
                <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-1 shadow-xl lg:sticky lg:top-16">
                    <div className="relative h-60 sm:h-80 lg:h-[540px] rounded-xl overflow-hidden">
                        <div ref={mapRef} className="w-full h-full z-10" />
                        <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-center gap-2 pointer-events-none shadow-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-semibold text-[11px]">Center: ({centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)})</span>
                        </div>
                    </div>
                </div>

                {/* ── Discovered Leads List Column ── */}
                <div className="lg:col-span-7 space-y-3.5">
                    
                    {/* Welcome / Scan Prompt State */}
                    {!discoveryData && !scanMutation.isPending && (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                            <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto">
                                <Compass className="w-7 h-7 animate-pulse" />
                            </div>
                            <div className="max-w-md mx-auto space-y-1.5">
                                <h3 className="text-base font-bold text-white">Ready to Discover Local Leads</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Click <strong className="text-indigo-400">"Scan Radius"</strong> or pick a preset location above to automatically pull surrounding restaurants &amp; cafes with automatic duplicate detection.
                                </p>
                            </div>
                            <button
                                onClick={handleSearchScan}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
                            >
                                Start Scanning Now
                            </button>
                        </div>
                    )}

                    {/* Summary Metrics Bar */}
                    {discoveryData && (
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                                <div>
                                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Found</p>
                                    <h4 className="text-base sm:text-xl font-extrabold text-white mt-0.5">{discoveryData.totalDiscovered}</h4>
                                </div>
                                <div className="p-2 sm:p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                                <div>
                                    <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Verified New</p>
                                    <h4 className="text-base sm:text-xl font-extrabold text-emerald-300 mt-0.5">{discoveryData.newCount}</h4>
                                </div>
                                <div className="p-2 sm:p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                                <div>
                                    <p className="text-[9px] sm:text-[10px] text-rose-400 font-bold uppercase tracking-wider">CRM Duplicates</p>
                                    <h4 className="text-base sm:text-xl font-extrabold text-rose-300 mt-0.5">{discoveryData.duplicateCount}</h4>
                                </div>
                                <div className="p-2 sm:p-2.5 bg-rose-500/20 rounded-xl text-rose-400">
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter & Batch Actions Header */}
                    {discoveryData && (
                        <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-lg">
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                                        activeTab === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800'
                                    }`}
                                >
                                    All ({allLeads.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('new')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                                        activeTab === 'new' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-400 hover:bg-slate-800'
                                    }`}
                                >
                                    Verified New ({discoveryData?.newCount || 0})
                                </button>
                                <button
                                    onClick={() => setActiveTab('duplicates')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                                        activeTab === 'duplicates' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:bg-slate-800'
                                    }`}
                                >
                                    Duplicates ({discoveryData?.duplicateCount || 0})
                                </button>
                            </div>

                            <div className="flex items-center gap-3 justify-between sm:justify-end">
                                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={hideDuplicates}
                                        onChange={(e) => setHideDuplicates(e.target.checked)}
                                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-950 cursor-pointer"
                                    />
                                    <span>Hide Duplicates</span>
                                </label>

                                <button
                                    onClick={handleToggleSelectAllNew}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg shrink-0"
                                >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                    Select All New
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cards Grid */}
                    {scanMutation.isPending ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl">
                            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                            <p className="text-sm font-medium">Scanning radius with OpenStreetMap Overpass API...</p>
                        </div>
                    ) : discoveryData && filteredLeads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 space-y-2 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl">
                            <Building2 className="w-10 h-10 text-slate-700" />
                            <h4 className="text-sm font-bold text-slate-200">No leads match current filter</h4>
                            <p className="text-xs text-slate-500 text-center max-w-xs">
                                Try changing location query, increasing radius, or unchecking duplicate filter.
                            </p>
                        </div>
                    ) : discoveryData ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 [scrollbar-width:thin]">
                            {filteredLeads.map((lead) => {
                                const isSelected = !!selectedLeads[lead.osm_id];
                                const isNew = lead.duplicateStatus === 'NEW';
                                const isDuplicate = lead.duplicateStatus === 'DUPLICATE';

                                return (
                                    <div
                                        key={lead.osm_id}
                                        onClick={() => handleToggleLead(lead.osm_id)}
                                        className={`p-3.5 sm:p-4 border rounded-2xl space-y-2 cursor-pointer transition-all active:scale-[0.99] ${
                                            isSelected
                                                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-600/10'
                                                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
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
                                                <div className="flex items-start justify-between gap-1.5">
                                                    <h4 className="font-bold text-sm text-slate-100 leading-snug line-clamp-1">{lead.restaurant_name}</h4>
                                                    {isNew ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Verified New
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${
                                                            isDuplicate
                                                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                                                                : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                                        }`}>
                                                            <AlertTriangle className="w-3 h-3" />
                                                            {lead.duplicateStatus}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                                                    <span className="bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-300">
                                                        {lead.cuisine || 'Food Outlet'}
                                                    </span>
                                                    {lead.phone && (
                                                        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                                                            <Phone className="w-3 h-3" />
                                                            {lead.phone}
                                                        </span>
                                                    )}
                                                </div>

                                                {lead.address && (
                                                    <p className="text-xs text-slate-400 truncate mt-1.5" title={lead.address}>
                                                        📍 {lead.address}
                                                    </p>
                                                )}

                                                {/* Duplicate match breakdown */}
                                                {!isNew && (
                                                    <div className="mt-2 text-xs bg-rose-950/40 border border-rose-900/50 text-rose-300 p-2 rounded-xl space-y-0.5">
                                                        <div className="flex items-center justify-between font-bold text-[11px]">
                                                            <span>Duplicate Confidence:</span>
                                                            <span className="text-rose-400">{lead.matchScore}%</span>
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
                    ) : null}

                    {/* Sticky Batch Import Footer */}
                    {discoveryData && (
                        <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl sticky bottom-2 z-20">
                            <div>
                                <p className="text-xs text-slate-400 text-center sm:text-left">
                                    {selectedLeadObjects.length > 0 ? (
                                        <span>
                                            Ready to import <strong className="text-indigo-400 font-bold">{selectedLeadObjects.length}</strong> selected leads into CRM
                                        </span>
                                    ) : (
                                        <span>Select leads to import into CRM database</span>
                                    )}
                                </p>
                            </div>

                            <button
                                onClick={handleBulkImport}
                                disabled={importMutation.isPending || selectedLeadObjects.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {importMutation.isPending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Importing Leads...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        <span>Import {selectedLeadObjects.length} Leads to CRM</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

export default AdminLeadDiscoveryView;
