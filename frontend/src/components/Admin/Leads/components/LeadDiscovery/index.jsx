import React from 'react';
import { Compass } from 'lucide-react';
import { useLeadDiscovery } from '../../hooks/useLeadDiscovery';
import { LeadDiscoveryControls } from './LeadDiscoveryControls';
import { LeadDiscoveryMap } from './LeadDiscoveryMap';
import { LeadDiscoveryMetrics } from './LeadDiscoveryMetrics';
import { LeadDiscoveryList } from './LeadDiscoveryList';

export function LeadDiscovery({ onImportSuccess }) {
    const {
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
    } = useLeadDiscovery({ onImportSuccess });

    const handleMapClick = (lat, lng) => {
        setCenterCoords({ lat, lng });
        setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-200 pb-16 md:pb-4">
            {/* Search & Radius Controls */}
            <LeadDiscoveryControls
                locationInput={locationInput}
                setLocationInput={setLocationInput}
                selectedRadius={selectedRadius}
                setSelectedRadius={setSelectedRadius}
                isScanning={scanMutation.isPending}
                onSearchScan={handleSearchScan}
                onLocationPresetClick={handleLocationPresetClick}
            />

            {/* Main 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Map Column */}
                <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-1 shadow-xl lg:sticky lg:top-16">
                    <LeadDiscoveryMap
                        centerCoords={centerCoords}
                        selectedRadius={selectedRadius}
                        locationInput={locationInput}
                        discoveryData={discoveryData}
                        onMapClick={handleMapClick}
                    />
                </div>

                {/* Discovered Leads Column */}
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

                    {/* Metrics Bar */}
                    <LeadDiscoveryMetrics discoveryData={discoveryData} />

                    {/* Discovered Lead List & Import Bar */}
                    <LeadDiscoveryList
                        discoveryData={discoveryData}
                        allLeads={allLeads}
                        filteredLeads={filteredLeads}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        hideDuplicates={hideDuplicates}
                        setHideDuplicates={setHideDuplicates}
                        selectedLeads={selectedLeads}
                        selectedLeadObjects={selectedLeadObjects}
                        isScanning={scanMutation.isPending}
                        isImporting={importMutation.isPending}
                        onToggleSelectAllNew={handleToggleSelectAllNew}
                        onToggleLead={handleToggleLead}
                        onBulkImport={handleBulkImport}
                    />
                </div>
            </div>
        </div>
    );
}

export default LeadDiscovery;
