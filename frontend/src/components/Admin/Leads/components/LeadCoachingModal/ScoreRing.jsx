import React from 'react';

export function ScoreRing({ score }) {
    const num = Number(score) || 0;
    const isHigh = num >= 8;
    const isMid  = num >= 5;

    const ringColor = isHigh ? 'text-emerald-400' : isMid ? 'text-blue-400' : 'text-amber-400';
    const bgColor   = isHigh ? 'bg-emerald-500/10 border-emerald-500/30' : isMid ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30';
    const label     = isHigh ? 'Excellent' : isMid ? 'Good' : 'Needs Focus';

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg ${bgColor}`}>
                <span className={`text-xl font-extrabold leading-none ${ringColor}`}>{score ?? '—'}</span>
                <span className="text-[9px] text-slate-500 font-medium">/10</span>
            </div>
            <span className={`text-[10px] font-semibold ${ringColor}`}>{label}</span>
        </div>
    );
}

export default ScoreRing;
