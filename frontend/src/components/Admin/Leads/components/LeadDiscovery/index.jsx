import React from 'react';
import { Compass } from 'lucide-react';
import { useLeadDiscovery } from '../../hooks/useLeadDiscovery';
import { LeadDiscoveryHeader } from './LeadDiscoveryHeader';
import { LeadDiscoveryControls } from './LeadDiscoveryControls';
import { LeadDiscoveryProgress } from './LeadDiscoveryProgress';
import { LeadDiscoveryMetrics } from './LeadDiscoveryMetrics';
import { LeadDiscoveryToolbar } from './LeadDiscoveryToolbar';
import { LeadDiscoveryMap } from './LeadDiscoveryMap';
import { LeadDiscoveryList } from './LeadDiscoveryList';
import { LeadPreviewDrawer } from './LeadPreviewDrawer';

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
    } = useLeadDiscovery({ onImportSuccess });

    const handleMapClick = (lat, lng) => {
        setCenterCoords({ lat, lng });
        setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-200 pb-16 md:pb-4 relative">
            {/* 1. Top Workspace Header */}
            <LeadDiscoveryHeader
                isScanning={scanMutation.isPending}
                discoveryData={discoveryData}
                onSearchScan={handleSearchScan}
            />

            {/* 2. Discovery Criteria Controls Bar */}
            <LeadDiscoveryControls
                locationInput={locationInput}
                setLocationInput={setLocationInput}
                selectedRadius={selectedRadius}
                setSelectedRadius={setSelectedRadius}
                isScanning={scanMutation.isPending}
                onSearchScan={handleSearchScan}
                onLocationPresetClick={handleLocationPresetClick}
            />

            {/* 3. Multi-Step Scan Progress Stepper */}
            <LeadDiscoveryProgress isScanning={scanMutation.isPending} />

            {/* 4. Full-Width Radar Map Container (Max Height 60dvh) */}
            <LeadDiscoveryMap
                centerCoords={centerCoords}
                selectedRadius={selectedRadius}
                locationInput={locationInput}
                discoveryData={discoveryData}
                onMapClick={handleMapClick}
            />

            {/* 5. Welcome / Blank Discovery Prompt */}
            {!discoveryData && !scanMutation.isPending && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                    <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto">
                        <Compass className="w-7 h-7 animate-pulse" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                        <h3 className="text-base font-bold text-white">Ready to Discover Local Leads</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Click <strong className="text-indigo-400">"Discover Leads"</strong> or pick a preset location above to automatically scan surrounding food outlets with automatic duplicate detection.
                        </p>
                    </div>
                    <button
                        onClick={handleSearchScan}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
                    >
                        Start Scanning Radar
                    </button>
                </div>
            )}

            {/* 6. Metrics Cards Bar */}
            <LeadDiscoveryMetrics discoveryData={discoveryData} />

            {/* 7. Discovered Leads Toolbar */}
            <LeadDiscoveryToolbar
                discoveryData={discoveryData}
                allLeadsCount={allLeads.length}
                newCount={discoveryData?.newCount || 0}
                duplicateCount={discoveryData?.duplicateCount || 0}
                filteredCount={filteredLeads.length}
                selectedCount={selectedLeadObjects.length}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                viewMode={viewMode}
                setViewMode={setViewMode}
                hideDuplicates={hideDuplicates}
                setHideDuplicates={setHideDuplicates}
                onToggleSelectAllNew={handleToggleSelectAllNew}
                onSelectAllFiltered={handleSelectAllFiltered}
                onDeselectAll={handleDeselectAll}
            />

            {/* 8. Discovered Leads Workspace (Full Width Table / Grid below map) */}
            <LeadDiscoveryList
                discoveryData={discoveryData}
                allLeads={allLeads}
                newLeadsOnly={newLeadsOnly}
                filteredLeads={filteredLeads}
                selectedLeads={selectedLeads}
                selectedLeadObjects={selectedLeadObjects}
                viewMode={viewMode}
                previewLead={previewLead}
                isScanning={scanMutation.isPending}
                isImporting={importMutation.isPending}
                onToggleSelectAllNew={handleToggleSelectAllNew}
                onToggleLead={handleToggleLead}
                onPreviewLead={setPreviewLead}
                onBulkImport={handleBulkImport}
                onImportOnlyNew={handleImportOnlyNewLeads}
                onImportSingleLead={handleImportSingleLead}
            />

            {/* 9. Right-Side Lead Inspection Drawer */}
            <LeadPreviewDrawer
                lead={previewLead}
                onClose={() => setPreviewLead(null)}
                onImportLead={handleImportSingleLead}
                isImporting={importMutation.isPending}
            />
        </div>
    );
}

export default LeadDiscovery;
