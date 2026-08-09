import React from 'react';
import { Building2, CheckCircle2, AlertTriangle } from 'lucide-react';

export function LeadDiscoveryMetrics({ discoveryData }) {
    if (!discoveryData) return null;

    return (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {/* Total POIs Found */}
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Total Found</p>
                    <h4 className="text-sm sm:text-xl font-extrabold text-white mt-0.5 leading-none">{discoveryData.totalDiscovered}</h4>
                </div>
                <div className="hidden xs:flex p-1.5 sm:p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                    <Building2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
            </div>

            {/* Verified New */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider truncate">Verified New</p>
                    <h4 className="text-sm sm:text-xl font-extrabold text-emerald-300 mt-0.5 leading-none">{discoveryData.newCount}</h4>
                </div>
                <div className="hidden xs:flex p-1.5 sm:p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
            </div>

            {/* CRM Duplicates */}
            <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-rose-400 font-bold uppercase tracking-wider truncate">Duplicates</p>
                    <h4 className="text-sm sm:text-xl font-extrabold text-rose-300 mt-0.5 leading-none">{discoveryData.duplicateCount}</h4>
                </div>
                <div className="hidden xs:flex p-1.5 sm:p-2.5 bg-rose-500/20 rounded-xl text-rose-400 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
            </div>
        </div>
    );
}

export default LeadDiscoveryMetrics;
