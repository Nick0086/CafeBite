import React from 'react';
import {
    CheckSquare,
    Square,
    CheckCircle2,
    AlertTriangle,
    Phone,
    MapPin,
    Eye,
    Download,
    Search,
    Sparkles,
} from 'lucide-react';

export function LeadDiscoveryTable({
    filteredLeads = [],
    selectedLeads = {},
    previewLead,
    onToggleLead,
    onPreviewLead,
    onImportSingleLead,
}) {
    if (filteredLeads.length === 0) return null;

    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[460px] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-track]:bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300 table-auto">
                    <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-3 w-10 text-center">Sel</th>
                            <th className="p-3">Restaurant &amp; Category</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Location &amp; Address</th>
                            <th className="p-3">Match Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                        {filteredLeads.map((lead) => {
                            const isSelected = !!selectedLeads[lead.osm_id];
                            const isNew = lead.duplicateStatus === 'NEW';
                            const isDuplicate = lead.duplicateStatus === 'DUPLICATE';
                            const isPreviewed = previewLead?.osm_id === lead.osm_id;

                            // Clean cuisine string (take first tag if semicolon-separated)
                            const primaryCuisine = (lead.cuisine || 'Food Outlet')
                                .split(';')[0]
                                .replace(/_/g, ' ');

                            return (
                                <tr
                                    key={lead.osm_id}
                                    className={`transition-colors cursor-pointer ${
                                        isPreviewed
                                            ? 'bg-indigo-900/30'
                                            : isSelected
                                            ? 'bg-indigo-950/20 hover:bg-indigo-900/20'
                                            : 'hover:bg-slate-800/40'
                                    }`}
                                    onClick={() => onPreviewLead(lead)}
                                >
                                    {/* Selection checkbox */}
                                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onToggleLead(lead.osm_id)}
                                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-4 h-4 fill-indigo-500/20" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-600" />
                                            )}
                                        </button>
                                    </td>

                                    {/* Name & Cuisine */}
                                    <td className="p-3 max-w-[200px]">
                                        <div className="font-bold text-sm text-slate-100 truncate" title={lead.restaurant_name}>
                                            {lead.restaurant_name}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block max-w-[150px] truncate capitalize" title={lead.cuisine}>
                                            {primaryCuisine}
                                        </span>
                                    </td>

                                    {/* Phone */}
                                    <td className="p-3">
                                        {lead.phone && lead.phone !== '+91 00000 00000' ? (
                                            <a
                                                href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 text-emerald-400 font-semibold hover:underline"
                                                title="Phone number auto-enriched & verified"
                                            >
                                                <Phone className="w-3 h-3" />
                                                <span>{lead.phone}</span>
                                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                            </a>
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
                                    </td>

                                    {/* Location */}
                                    <td className="p-3 max-w-[200px]">
                                        {lead.address ? (
                                            <span className="truncate block text-slate-400" title={lead.address}>
                                                📍 {lead.address}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-rose-400" />
                                                {lead.city || 'Local area'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="p-3">
                                        {isNew ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified New
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                                isDuplicate
                                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                            }`}>
                                                <AlertTriangle className="w-3 h-3" />
                                                {lead.duplicateStatus} ({lead.matchScore}%)
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => onPreviewLead(lead)}
                                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                                title="Inspect details"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onImportSingleLead(lead)}
                                                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                                                title="Import into CRM"
                                            >
                                                <Download className="w-3 h-3" />
                                                Import
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LeadDiscoveryTable;
