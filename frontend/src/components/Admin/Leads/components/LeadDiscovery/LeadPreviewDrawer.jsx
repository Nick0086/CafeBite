import React, { useState } from 'react';
import {
    X,
    Building2,
    CheckCircle2,
    AlertTriangle,
    Phone,
    MapPin,
    ExternalLink,
    Download,
    Copy,
    Check,
    Compass,
    Search,
} from 'lucide-react';
import { toastSuccess } from '@/utils/toast-utils';

export function LeadPreviewDrawer({
    lead,
    onClose,
    onImportLead,
    isImporting,
}) {
    const [copied, setCopied] = useState(false);

    if (!lead) return null;

    const isNew = lead.duplicateStatus === 'NEW';
    const isDuplicate = lead.duplicateStatus === 'DUPLICATE';

    const handleCopyDetails = () => {
        const text = `Restaurant: ${lead.restaurant_name}\nPhone: ${lead.phone || 'N/A'}\nAddress: ${lead.address || 'N/A'}\nCuisine: ${lead.cuisine || 'N/A'}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toastSuccess('Lead details copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click backdrop to close */}
            <div className="flex-1" onClick={onClose} />

            {/* Slide-over Drawer Panel */}
            <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
                {/* Drawer Header */}
                <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3 shrink-0">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0 mt-0.5">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-slate-100 line-clamp-2 leading-snug">
                                {lead.restaurant_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded-md">
                                    {lead.cuisine || 'Food Outlet'}
                                </span>
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
                                        {lead.duplicateStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Drawer Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 [scrollbar-width:thin]">

                    {/* Duplicate Match Confidence Card */}
                    {!isNew && (
                        <div className="bg-rose-950/30 border border-rose-900/50 rounded-2xl p-3.5 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between font-bold text-rose-300">
                                <span className="flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                                    CRM Duplicate Warning
                                </span>
                                <span className="text-rose-400 text-sm font-extrabold">{lead.matchScore}% Match</span>
                            </div>
                            <p className="text-rose-300/80 leading-relaxed text-[11px]">
                                {lead.matchReason || 'Similar restaurant already exists in CRM database.'}
                            </p>
                        </div>
                    )}

                    {/* Contact Information Section */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact &amp; Details</h4>

                        <div className="space-y-2.5 text-xs">
                            {/* Phone */}
                            <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Phone className="w-4 h-4 text-emerald-400" />
                                    <span className="font-semibold">Phone:</span>
                                </div>
                                {lead.phone && lead.phone !== '+91 00000 00000' ? (
                                    <a
                                        href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        {lead.phone}
                                    </a>
                                ) : (
                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent((lead.restaurant_name || '') + ' ' + (lead.city || '') + ' phone number')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition-colors"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                        <span>Find Phone on Google</span>
                                    </a>
                                )}
                            </div>

                            {/* Full Address */}
                            <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <MapPin className="w-4 h-4 text-rose-400" />
                                    <span className="font-semibold">Address:</span>
                                </div>
                                <p className="text-slate-400 pl-6 leading-relaxed">
                                    {lead.address || lead.city || 'No detailed address provided'}
                                </p>
                            </div>

                            {/* Coordinates & Source */}
                            <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Compass className="w-4 h-4 text-indigo-400" />
                                    <span className="font-semibold">Map Coordinates:</span>
                                </div>
                                <div className="text-slate-400 pl-6 font-mono text-[11px]">
                                    Lat: {lead.latitude?.toFixed(4)}, Lng: {lead.longitude?.toFixed(4)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Source & Verification Metadata Card */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Metadata</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                                {lead.place_source === 'google' ? 'Google Places' : 'OSM + Web Enriched'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl">
                                <span className="text-[10px] text-slate-400 font-semibold block">Data Provider</span>
                                <span className="font-bold text-slate-200 mt-0.5 block capitalize">
                                    {lead.place_source || 'OSM Radar'}
                                </span>
                            </div>
                            <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl">
                                <span className="text-[10px] text-slate-400 font-semibold block">Phone Origin</span>
                                <span className="font-bold text-emerald-400 mt-0.5 block flex items-center gap-1 text-[11px]">
                                    {lead.phone ? (
                                        <>
                                            <Sparkles className="w-3 h-3 text-amber-400" />
                                            Auto-Enriched
                                        </>
                                    ) : (
                                        <span className="text-slate-500 font-normal">Not Found</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Verification Links */}
                        <div className="pt-1 flex items-center gap-2">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lead.restaurant_name || '') + ' ' + (lead.city || 'Surat'))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                            >
                                <ExternalLink className="w-3 h-3 text-indigo-400" />
                                Verify Maps
                            </a>
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent((lead.restaurant_name || '') + ' ' + (lead.city || 'Surat') + ' phone number address')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold transition-all active:scale-95"
                            >
                                <Search className="w-3 h-3 text-amber-400" />
                                Verify Phone
                            </a>
                        </div>
                    </div>

                    {/* Quick Link Buttons */}
                    <div className="flex items-center gap-2">
                        <a
                            href={
                                lead.google_maps_url && !lead.google_maps_url.includes('?q=21.') && !lead.google_maps_url.includes('?q=23.')
                                    ? lead.google_maps_url
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lead.restaurant_name || '') + ' ' + (lead.city || ''))}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                            View on Google Maps
                        </a>
                        <button
                            onClick={handleCopyDetails}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            title="Copy lead details"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>

                </div>

                {/* Sticky Drawer Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onImportLead(lead)}
                        disabled={isImporting}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Import Lead to CRM</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LeadPreviewDrawer;
