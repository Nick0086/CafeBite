import React, { useRef, useState } from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';
import { toastError } from '@/utils/toast-utils';

export function AudioDropzone({ onFileSelected, isPending }) {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (file) => {
        if (!file) return;
        if (file.size > 25 * 1024 * 1024) {
            toastError('File exceeds 25 MB limit');
            return;
        }
        if (!/\.(mp3|m4a|wav|webm|ogg)$/i.test(file.name)) {
            toastError('Invalid format. Upload .mp3, .m4a, .wav, .webm, or .ogg');
            return;
        }
        onFileSelected(file);
    };

    const handleDragOver  = (e) => { e.preventDefault(); setDragActive(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
    const handleDrop      = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Upload Sales Recording
                </span>
                <span className="text-[10px] text-slate-500">
                    mp3 · m4a · wav · webm · ogg · Max 25MB
                </span>
            </div>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isPending && fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all
                    ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}
                    ${dragActive
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.m4a,.wav,.webm,.ogg,audio/*"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                />
                {isPending ? (
                    <div className="space-y-3 py-2">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-indigo-400 flex items-center justify-center gap-1.5">
                            <Sparkles className="w-4 h-4 animate-bounce" />
                            Gemini AI is analyzing...
                        </p>
                        <p className="text-xs text-slate-500">
                            Transcribing · Scoring · Generating coaching insights
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-200">
                                <span className="text-indigo-400 font-semibold">Tap to upload</span> or drag &amp; drop
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Instant Gemini AI sales analysis &amp; coaching
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AudioDropzone;
