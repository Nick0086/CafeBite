import React from 'react';
import { Building2, CheckCircle2, AlertTriangle } from 'lucide-react';

export function LeadDiscoveryMetrics({ discoveryData }) {
    if (!discoveryData) return null;

    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Found</p>
                    <h4 className="text-base sm:text-xl font-extrabold text-white mt-0.5">{discoveryData.totalDiscovered}</h4>
                </div>
                <div className="p-2 sm:p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Verified New</p>
                    <h4 className="text-base sm:text-xl font-extrabold text-emerald-300 mt-0.5">{discoveryData.newCount}</h4>
                </div>
                <div className="p-2 sm:p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[9px] sm:text-[10px] text-rose-400 font-bold uppercase tracking-wider">CRM Duplicates</p>
                    <h4 className="text-base sm:text-xl font-extrabold text-rose-300 mt-0.5">{discoveryData.duplicateCount}</h4>
                </div>
                <div className="p-2 sm:p-2.5 bg-rose-500/20 rounded-xl text-rose-400">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
            </div>
        </div>
    );
}

export default LeadDiscoveryMetrics;
