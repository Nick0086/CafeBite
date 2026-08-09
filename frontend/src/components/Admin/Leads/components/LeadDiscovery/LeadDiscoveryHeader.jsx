import React from 'react';
import { Radar, Compass, RefreshCw, Layers } from 'lucide-react';

export function LeadDiscoveryHeader({
    isScanning,
    discoveryData,
    onSearchScan,
}) {
    const totalFound = discoveryData?.totalDiscovered || 0;
    const newCount = discoveryData?.newCount || 0;

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                    <Radar className={`w-6 h-6 ${isScanning ? 'animate-spin text-purple-400' : 'animate-spin-slow'}`} />
                </div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Lead Discovery Radar</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-amber-400 animate-ping' : discoveryData ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                            {isScanning ? 'Scanning Radius...' : discoveryData ? 'Leads Discovered' : 'Radar Ready'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                        Pull real-time restaurants, cafes &amp; food outlets around any target location via OpenStreetMap with automated duplicate detection.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 justify-end">
                {discoveryData && (
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <Compass className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{totalFound} POIs</span>
                        </div>
                        <span className="text-slate-700">|</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{newCount} New</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeadDiscoveryHeader;
