import React from 'react';
import { Radar, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
    { title: 'Querying OSM Radar', desc: 'Overpass API scan' },
    { title: 'Extracting POIs', desc: 'Phone & coordinates' },
    { title: 'Deduplicating CRM', desc: 'Smart name match' },
    { title: 'Ready', desc: 'Verification tags' },
];

export function LeadDiscoveryProgress({ isScanning }) {
    if (!isScanning) return null;

    return (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                        <Sparkles className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <span>Scanning OpenStreetMap Radar</span>
                            <span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                Live Scan
                            </span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Processing POIs, phone numbers, and match scores...
                        </p>
                    </div>
                </div>
                <Radar className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 animate-pulse w-3/4 transition-all duration-500" />
            </div>

            {/* Step Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {STEPS.map((step, idx) => (
                    <div key={idx} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{step.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate pl-5">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LeadDiscoveryProgress;
