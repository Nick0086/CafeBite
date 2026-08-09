import React, { useState } from 'react';
import { Volume2, Clock, FileAudio, ChevronDown, ChevronUp } from 'lucide-react';
import { ScoreRing } from './ScoreRing';

export function AudioPlayer({ activeRecording }) {
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    if (!activeRecording) return null;

    return (
        <div className="space-y-4">
            {/* Score + Audio Player */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-800/80">
                {/* Score Ring */}
                <div className="flex items-center gap-4 sm:shrink-0">
                    <ScoreRing score={activeRecording.selling_score} />
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Selling Score</p>
                        <p className="text-sm font-bold text-slate-100 mt-0.5">
                            {Number(activeRecording.selling_score) >= 8
                                ? 'High Performance'
                                : Number(activeRecording.selling_score) >= 5
                                ? 'Moderate Performance'
                                : 'Needs Coaching'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(activeRecording.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Audio Player */}
                <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <Volume2 className="w-4 h-4 text-indigo-400" />
                            {activeRecording.file_name}
                        </span>
                        <span className="text-slate-500">
                            {(activeRecording.file_size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                    </div>
                    <audio
                        controls
                        src={activeRecording.file_url}
                        className="w-full h-9 rounded-lg"
                    >
                        Audio not supported.
                    </audio>
                </div>
            </div>

            {/* Transcript Accordion */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
                <button
                    onClick={() => setTranscriptOpen((v) => !v)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-indigo-400" />
                        Full Transcript
                    </span>
                    {transcriptOpen
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                </button>
                {transcriptOpen && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono max-h-52 overflow-y-auto">
                        {activeRecording.transcript || 'No transcript available for this recording.'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AudioPlayer;
