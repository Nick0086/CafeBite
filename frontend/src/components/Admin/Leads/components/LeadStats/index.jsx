import React from 'react';
import { STAT_CARDS } from '../../constants/adminLeads.constants';

export function LeadStats({ stats = {} }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {STAT_CARDS.map(({ key, label, icon: Icon, colorClass, bgClass, numClass }) => (
                <div
                    key={key}
                    className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2"
                >
                    <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                        <h3 className={`text-xl font-extrabold mt-0.5 leading-none ${numClass}`}>
                            {stats[key] ?? 0}
                        </h3>
                    </div>
                    <div className={`p-2 border rounded-lg ${bgClass}`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LeadStats;
