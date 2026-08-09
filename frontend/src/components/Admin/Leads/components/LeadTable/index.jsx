import React from 'react';
import { RefreshCw, Building2, Plus, Sparkles, MapPin, PhoneCall, ExternalLink, BrainCircuit, Pencil, Trash2 } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadCard } from './LeadCard';

export function LeadTable({
    leads = [],
    isLoading,
    onEdit,
    onDelete,
    onCoaching,
    onCreateLead,
}) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-14 space-y-3 text-slate-400">
                <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
                <p className="text-sm">Loading pipeline records...</p>
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-14 space-y-3 text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
                <Building2 className="w-10 h-10 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-200">No leads found</h3>
                <p className="text-xs text-slate-400 max-w-xs text-center">
                    No restaurant leads match your current filter. Try changing the status tab or search term.
                </p>
                <button
                    onClick={onCreateLead}
                    className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Add First Lead
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Card Grid */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {leads.map((lead) => (
                    <LeadCard
                        key={lead.unique_id || lead.id}
                        lead={lead}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onCoaching={onCoaching}
                    />
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-slate-900/70 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3">Restaurant &amp; Contact</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Maps</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Notes</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {leads.map((lead) => (
                                <tr key={lead.unique_id || lead.id} className="hover:bg-slate-800/25 transition-colors group">
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onCoaching(lead)}
                                            className="font-semibold text-sm text-slate-100 hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5 group/btn cursor-pointer"
                                        >
                                            <span>{lead.restaurant_name}</span>
                                            <Sparkles className="w-3 h-3 text-indigo-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        </button>
                                        {lead.contact_person && (
                                            <div className="text-xs text-slate-500 mt-0.5">{lead.contact_person}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-slate-200 font-medium text-sm">
                                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                            <span>{lead.city}</span>
                                        </div>
                                        {lead.address && (
                                            <div className="text-xs text-slate-500 truncate max-w-[140px] mt-0.5" title={lead.address}>
                                                {lead.address}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {lead.phone ? (
                                            <a
                                                href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all"
                                            >
                                                <PhoneCall className="w-3 h-3" />
                                                <span>{lead.phone}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {lead.google_maps_url ? (
                                            <a
                                                href={lead.google_maps_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg text-xs font-medium transition-all"
                                            >
                                                <MapPin className="w-3 h-3 text-indigo-400" />
                                                <span>View</span>
                                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <LeadStatusBadge status={lead.status} />
                                    </td>
                                    <td className="px-4 py-3 max-w-[160px]">
                                        <p className="text-xs text-slate-400 truncate" title={lead.notes || ''}>
                                            {lead.notes || '—'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => onCoaching(lead)}
                                                className="px-2 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                                title="AI Coaching"
                                            >
                                                <BrainCircuit className="w-3 h-3" />
                                                AI
                                            </button>
                                            <button
                                                onClick={() => onEdit(lead)}
                                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(lead)}
                                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default LeadTable;
