import React from 'react';
import {
    Building2,
    CheckCircle2,
    AlertTriangle,
    CheckSquare,
    Square,
    RefreshCw,
    Download,
    Phone,
} from 'lucide-react';

export function LeadDiscoveryList({
    discoveryData,
    allLeads = [],
    filteredLeads = [],
    activeTab,
    setActiveTab,
    hideDuplicates,
    setHideDuplicates,
    selectedLeads = {},
    selectedLeadObjects = [],
    isScanning,
    isImporting,
    onToggleSelectAllNew,
    onToggleLead,
    onBulkImport,
}) {
    return (
        <div className="space-y-3.5">
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
                            onClick={onToggleSelectAllNew}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg shrink-0"
                        >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Select All New
                        </button>
                    </div>
                </div>
            )}

            {/* Cards Grid / States */}
            {isScanning ? (
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
                                onClick={() => onToggleLead(lead.osm_id)}
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
                        onClick={onBulkImport}
                        disabled={isImporting || selectedLeadObjects.length === 0}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isImporting ? (
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
    );
}

export default LeadDiscoveryList;
