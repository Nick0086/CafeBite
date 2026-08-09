import React from 'react';
import { FileAudio } from 'lucide-react';

export function RecordingSelector({
    recordings = [],
    activeRecordingId,
    onSelectRecording,
}) {
    if (recordings.length <= 1) return null;

    return (
        <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Call Recordings ({recordings.length})
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {recordings.map((rec, index) => {
                    const isSelected = activeRecordingId === rec.unique_id;
                    return (
                        <button
                            key={rec.unique_id}
                            onClick={() => onSelectRecording(rec.unique_id)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 border transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/20'
                                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-400'
                            }`}
                        >
                            <FileAudio className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Call #{recordings.length - index}</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded text-[9px] font-bold">
                                {rec.selling_score ?? '?'}/10
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default RecordingSelector;
