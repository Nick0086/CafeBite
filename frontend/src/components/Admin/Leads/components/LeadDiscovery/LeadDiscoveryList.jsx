import React from 'react';
import {
    Building2,
    CheckCircle2,
    AlertTriangle,
    CheckSquare,
    Square,
    Download,
    Phone,
    Eye,
    Search,
    Sparkles,
} from 'lucide-react';
import { LeadDiscoveryTable } from './LeadDiscoveryTable';

export function LeadDiscoveryList({
    discoveryData,
    allLeads = [],
    newLeadsOnly = [],
    filteredLeads = [],
    selectedLeads = {},
    selectedLeadObjects = [],
    viewMode = 'table',
    previewLead,
    isScanning,
    isImporting,
    onToggleSelectAllNew,
    onToggleLead,
    onPreviewLead,
    onBulkImport,
    onImportOnlyNew,
    onImportSingleLead,
}) {
    if (!discoveryData) return null;

    if (filteredLeads.length === 0 && !isScanning) {
        return (
            <div className="flex flex-col items-center justify-center py-14 space-y-2 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-inner">
                <Building2 className="w-10 h-10 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-200">No leads match your criteria</h4>
                <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed">
                    Try clearing search query, expanding scan radius, or unchecking duplicate filter.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3.5 relative">
            {/* View Mode: Data Table or Cards Grid */}
            {viewMode === 'table' ? (
                <LeadDiscoveryTable
                    filteredLeads={filteredLeads}
                    selectedLeads={selectedLeads}
                    previewLead={previewLead}
                    onToggleLead={onToggleLead}
                    onPreviewLead={onPreviewLead}
                    onImportSingleLead={onImportSingleLead}
                />
            ) : (
                /* Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-track]:bg-slate-950">
                    {filteredLeads.map((lead) => {
                        const isSelected = !!selectedLeads[lead.osm_id];
                        const isNew = lead.duplicateStatus === 'NEW';
                        const isDuplicate = lead.duplicateStatus === 'DUPLICATE';
                        const isPreviewed = previewLead?.osm_id === lead.osm_id;

                        const primaryCuisine = (lead.cuisine || 'Food Outlet')
                            .split(';')[0]
                            .replace(/_/g, ' ');

                        return (
                            <div
                                key={lead.osm_id}
                                onClick={() => onPreviewLead(lead)}
                                className={`p-3.5 sm:p-4 border rounded-2xl space-y-2.5 cursor-pointer transition-all active:scale-[0.99] ${
                                    isPreviewed
                                        ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-600/20'
                                        : isSelected
                                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-600/10'
                                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                                }`}
                            >
                                <div className="flex items-start gap-2.5">
                                    <button
                                        className="mt-0.5 text-indigo-400 shrink-0 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleLead(lead.osm_id);
                                        }}
                                    >
                                        {isSelected ? (
                                            <CheckSquare className="w-4 h-4 text-indigo-400 fill-indigo-500/20" />
                                        ) : (
                                            <Square className="w-4 h-4 text-slate-600" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1.5">
                                            <h4 className="font-bold text-sm text-slate-100 leading-snug line-clamp-1">
                                                {lead.restaurant_name}
                                            </h4>
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
                                            <span className="bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-300 capitalize truncate max-w-[140px]">
                                                {primaryCuisine}
                                            </span>
                                            {lead.phone && lead.phone !== '+91 00000 00000' ? (
                                                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs" title="Phone number auto-enriched & verified">
                                                    <Phone className="w-3 h-3 text-emerald-400" />
                                                    <span>{lead.phone}</span>
                                                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                                </span>
                                            ) : (
                                                <a
                                                    href={`https://www.google.com/search?q=${encodeURIComponent((lead.restaurant_name || '') + ' ' + (lead.city || '') + ' phone number')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md hover:bg-amber-500/20 transition-colors"
                                                    title="Search phone number on Google"
                                                >
                                                    <Search className="w-3 h-3" />
                                                    <span>Find Phone</span>
                                                </a>
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
                                                    <span>Duplicate Match:</span>
                                                    <span className="text-rose-400">{lead.matchScore}%</span>
                                                </div>
                                                <p className="text-rose-400 text-[10px] line-clamp-1">{lead.matchReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Quick Action Bar on Card */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                                    <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        Inspect details
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onImportSingleLead(lead);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <Download className="w-3 h-3" />
                                        Import
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Partial & Selective Import Options Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xl sticky bottom-2 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-100">
                            Partial &amp; Selective CRM Import Options
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Selected <strong className="text-indigo-400">{selectedLeadObjects.length}</strong> leads | Verified New <strong className="text-emerald-400">{newLeadsOnly.length}</strong> leads
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Option A: Import ONLY Verified New Leads */}
                    <button
                        onClick={onImportOnlyNew}
                        disabled={isImporting || newLeadsOnly.length === 0}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Import Verified New Only ({newLeadsOnly.length})</span>
                    </button>

                    {/* Option B: Import Currently Selected Leads */}
                    <button
                        onClick={onBulkImport}
                        disabled={isImporting || selectedLeadObjects.length === 0}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Import Selected ({selectedLeadObjects.length} Leads)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LeadDiscoveryList;
