import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    X,
    UploadCloud,
    FileAudio,
    Sparkles,
    Volume2,
    CheckCircle2,
    AlertCircle,
    BrainCircuit,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Clock,
    Building2,
    PhoneCall,
    MapPin,
    Target,
    Star,
} from 'lucide-react';
import { fetchAdminLeadRecordings, uploadAdminLeadRecording } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

// ─── Score Ring ────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
    const num = Number(score) || 0;
    const isHigh = num >= 8;
    const isMid  = num >= 5;

    const ringColor = isHigh ? 'text-emerald-400' : isMid ? 'text-blue-400' : 'text-amber-400';
    const bgColor   = isHigh ? 'bg-emerald-500/10 border-emerald-500/30' : isMid ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30';
    const label     = isHigh ? 'Excellent' : isMid ? 'Good' : 'Needs Focus';

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg ${bgColor}`}>
                <span className={`text-2xl font-extrabold leading-none ${ringColor}`}>{score ?? '—'}</span>
                <span className="text-[9px] text-slate-500 font-medium">/10</span>
            </div>
            <span className={`text-[10px] font-semibold ${ringColor}`}>{label}</span>
        </div>
    );
}

// ─── Section Card ──────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconColor, title, children }) {
    return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h5 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${iconColor}`}>
                <Icon className="w-4 h-4" />
                {title}
            </h5>
            {children}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export function AdminLeadCoachingPanelModal({ open, lead, onClose }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [dragActive, setDragActive] = useState(false);
    const [selectedRecordingId, setSelectedRecordingId] = useState(null);
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    const leadId = lead?.unique_id || lead?.id;

    const {
        data: recordingsData,
        isLoading: isLoadingRecordings,
        refetch: refetchRecordings,
    } = useQuery({
        queryKey: ['admin-lead-recordings', leadId],
        queryFn: () => fetchAdminLeadRecordings(leadId),
        enabled: Boolean(open && leadId),
    });

    const recordings = recordingsData?.data?.recordings || [];
    const activeRecording = selectedRecordingId
        ? recordings.find((r) => r.unique_id === selectedRecordingId) || recordings[0]
        : recordings[0];

    const uploadMutation = useMutation({
        mutationFn: (file) => uploadAdminLeadRecording(leadId, file),
        onSuccess: (res) => {
            toastSuccess(res?.message || 'Audio analyzed by Gemini AI');
            refetchRecordings();
            queryClient.invalidateQueries({ queryKey: ['admin-lead-recordings', leadId] });
            if (res?.data?.recording?.unique_id) {
                setSelectedRecordingId(res.data.recording.unique_id);
            }
        },
        onError: (error) => {
            toastError(error?.err?.message || error?.message || 'Upload failed');
        },
    });

    if (!open || !lead) return null;

    const handleFileSelected = (file) => {
        if (!file) return;
        if (file.size > 25 * 1024 * 1024) { toastError('File exceeds 25 MB limit'); return; }
        if (!/\.(mp3|m4a|wav|webm|ogg)$/i.test(file.name)) {
            toastError('Invalid format. Upload .mp3, .m4a, .wav, .webm, or .ogg');
            return;
        }
        uploadMutation.mutate(file);
    };

    const handleDragOver  = (e) => { e.preventDefault(); setDragActive(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
    const handleDrop      = (e) => {
        e.preventDefault(); setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0]);
    };

    return (
        // Full-screen overlay, bottom-sheet on mobile
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md">
            <div className="
                w-full bg-slate-900 border-t sm:border border-slate-800
                rounded-t-3xl sm:rounded-2xl shadow-2xl
                flex flex-col
                max-h-[95dvh] sm:max-h-[90vh]
                sm:max-w-3xl sm:mx-4
                overflow-hidden
            ">
                {/* Drag handle */}
                <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-slate-700" />
                </div>

                {/* ── Header ── */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/50 flex items-start justify-between gap-3 shrink-0">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-base sm:text-lg text-slate-100 truncate">
                                    {lead.restaurant_name}
                                </h3>
                                <span className="shrink-0 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-semibold rounded-full">
                                    AI Coaching
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                                {lead.contact_person && (
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3 text-slate-500" />
                                        {lead.contact_person}
                                    </span>
                                )}
                                {lead.city && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-rose-400" />
                                        {lead.city}
                                    </span>
                                )}
                                {lead.phone && (
                                    <a href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                                       className="flex items-center gap-1 text-emerald-400 font-medium">
                                        <PhoneCall className="w-3 h-3" />
                                        {lead.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">

                    {/* ── Audio Upload Dropzone ── */}
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
                            onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
                            className={`
                                border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center transition-all
                                ${uploadMutation.isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}
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
                                onChange={(e) => handleFileSelected(e.target.files[0])}
                                className="hidden"
                            />
                            {uploadMutation.isPending ? (
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
                                    <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            <span className="text-indigo-400 font-semibold">Tap to upload</span> or drag & drop
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Instant Gemini AI sales analysis & coaching
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Recording Selector Tabs ── */}
                    {recordings.length > 1 && (
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Call Recordings ({recordings.length})
                            </span>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                {recordings.map((rec, index) => {
                                    const isSelected = activeRecording?.unique_id === rec.unique_id;
                                    return (
                                        <button
                                            key={rec.unique_id}
                                            onClick={() => { setSelectedRecordingId(rec.unique_id); setTranscriptOpen(false); }}
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
                    )}

                    {/* ── Analysis Panel ── */}
                    {isLoadingRecordings ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2 text-slate-400 bg-slate-950/40 border border-slate-800 rounded-2xl">
                            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                            <p className="text-sm">Loading coaching records...</p>
                        </div>
                    ) : activeRecording ? (
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">

                            {/* Score + Audio Player */}
                            <div className="p-4 sm:p-5 space-y-4">
                                {/* Mobile: stacked. Desktop: side-by-side */}
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

                                {/* Strengths & Improvements */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SectionCard icon={CheckCircle2} iconColor="text-emerald-400" title="Key Strengths">
                                        {activeRecording.strengths?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {activeRecording.strengths.map((str, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                                                        <Star className="w-2.5 h-2.5" />
                                                        {str}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500">No strengths recorded.</p>
                                        )}
                                    </SectionCard>

                                    <SectionCard icon={AlertCircle} iconColor="text-amber-400" title="Areas to Improve">
                                        {activeRecording.improvements?.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {activeRecording.improvements.map((imp, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                                                        <span>{imp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-slate-500">No improvements listed.</p>
                                        )}
                                    </SectionCard>
                                </div>

                                {/* Objection Handling */}
                                {activeRecording.objection_handling?.length > 0 && (
                                    <SectionCard icon={Target} iconColor="text-indigo-400" title="Objection Handling Tips">
                                        <ul className="space-y-2">
                                            {activeRecording.objection_handling.map((obj, idx) => (
                                                <li key={idx} className="text-xs text-slate-300 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                                                    {obj}
                                                </li>
                                            ))}
                                        </ul>
                                    </SectionCard>
                                )}

                                {/* Closing Recommendations */}
                                {activeRecording.closing_recommendations && (
                                    <SectionCard icon={Sparkles} iconColor="text-purple-400" title="Closing Plan & Next Steps">
                                        <p className="text-xs text-slate-300 leading-relaxed bg-purple-500/5 border border-purple-500/15 p-3 rounded-xl">
                                            {activeRecording.closing_recommendations}
                                        </p>
                                    </SectionCard>
                                )}

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
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-14 space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-slate-400">
                            <FileAudio className="w-12 h-12 text-slate-700" />
                            <h4 className="text-base font-semibold text-slate-200">No recordings yet</h4>
                            <p className="text-xs text-slate-500 max-w-xs text-center">
                                Upload a sales call recording above — Gemini AI will transcribe and generate personalized coaching insights.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Sticky Footer ── */}
                <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        Powered by Google Gemini AI
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminLeadCoachingPanelModal;
