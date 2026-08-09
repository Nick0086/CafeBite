import React from 'react';
import { MapPin, PhoneCall, ExternalLink, BrainCircuit, Pencil, Trash2, Search } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge';

export function LeadCard({ lead, onEdit, onDelete, onCoaching }) {
    const hasValidPhone = lead.phone && lead.phone !== '+91 00000 00000';

    return (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 active:scale-[0.99] transition-transform">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="w-full min-w-0 font-bold text-sm text-slate-100 line-clamp-2 break-words">
                        {lead.restaurant_name}
                    </p>
                    {lead.contact_person && (
                        <p className="text-xs text-slate-400 mt-0.5">{lead.contact_person}</p>
                    )}
                </div>
                <LeadStatusBadge status={lead.status} />
            </div>

            {/* Location & Phone */}
            <div className="flex flex-wrap items-center gap-1.5">
                {lead.city && (
                    <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/60 px-2 py-1 rounded-lg">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="font-medium">{lead.city}</span>
                    </div>
                )}
                {hasValidPhone ? (
                    <a
                        href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                        title={lead.restaurant_name}
                        className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg font-semibold active:bg-emerald-500/20 transition-colors"
                    >
                        <PhoneCall className="w-3 h-3" />
                        <span>{lead.phone}</span>
                    </a>
                ) : (
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent((lead.restaurant_name || '') + ' ' + (lead.city || '') + ' phone number')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg font-semibold hover:bg-amber-500/20 transition-colors"
                        title="Search phone number on Google"
                    >
                        <Search className="w-3 h-3" />
                        <span>Find Phone</span>
                    </a>
                )}
                {lead.google_maps_url && (
                    <a
                        href={lead.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-300 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg font-medium active:bg-slate-700 transition-colors"
                    >
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span>Maps</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                )}
            </div>

            {/* Notes */}
            {lead.notes && (
                <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                    {lead.notes}
                </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                <button
                    onClick={() => onCoaching(lead)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    AI Coaching
                </button>
                <button
                    onClick={() => onEdit(lead)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors active:scale-95 cursor-pointer"
                    title="Edit Lead"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(lead)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg transition-colors active:scale-95 cursor-pointer"
                    title="Delete Lead"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default LeadCard;
