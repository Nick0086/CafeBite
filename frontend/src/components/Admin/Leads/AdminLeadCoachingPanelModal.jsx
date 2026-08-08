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
} from 'lucide-react';
import { fetchAdminLeadRecordings, uploadAdminLeadRecording } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

export function AdminLeadCoachingPanelModal({ open, lead, onClose }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [dragActive, setDragActive] = useState(false);
    const [selectedRecordingId, setSelectedRecordingId] = useState(null);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const leadId = lead?.unique_id || lead?.id;

    // Fetch past recordings for lead
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

    // Select the latest recording or user selected recording
    const activeRecording = selectedRecordingId
        ? recordings.find((r) => r.unique_id === selectedRecordingId) || recordings[0]
        : recordings[0];

    // Upload & Analyze Recording Mutation
    const uploadMutation = useMutation({
        mutationFn: (file) => uploadAdminLeadRecording(leadId, file),
        onSuccess: (res) => {
            toastSuccess(res?.message || 'Audio recording analyzed successfully by Gemini AI');
            setSelectedFile(null);
            refetchRecordings();
            queryClient.invalidateQueries({ queryKey: ['admin-lead-recordings', leadId] });
            if (res?.data?.recording?.unique_id) {
                setSelectedRecordingId(res.data.recording.unique_id);
            }
        },
        onError: (error) => {
            toastError(error?.err?.message || error?.message || 'Failed to upload and analyze audio recording');
        },
    });

    if (!open || !lead) return null;

    const handleFileSelected = (file) => {
        if (!file) return;

        // Check file size (max 25MB)
        if (file.size > 25 * 1024 * 1024) {
            toastError('File size exceeds 25 MB limit');
            return;
        }

        // Check file extension
        const allowedExts = /\.(mp3|m4a|wav|webm|ogg)$/i;
        if (!allowedExts.test(file.name)) {
            toastError('Invalid audio format. Please upload .mp3, .m4a, .wav, .webm, or .ogg audio file');
            return;
        }

        setSelectedFile(file);
        uploadMutation.mutate(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    };

    const getScoreBadge = (score) => {
        const numScore = Number(score) || 0;
        if (numScore >= 8) {
            return {
                bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                label: 'High Performance / Excellent',
                ring: 'border-emerald-500',
            };
        } else if (numScore >= 5) {
            return {
                bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                label: 'Moderate Performance / Good',
                ring: 'border-blue-500',
            };
        }
        return {
            bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
            label: 'Needs Coaching / Focus Required',
            ring: 'border-amber-500',
        };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                            <BrainCircuit className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-slate-100">{lead.restaurant_name}</h3>
                                <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full">
                                    AI Sales Coaching
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5">
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
                                    <span className="flex items-center gap-1">
                                        <PhoneCall className="w-3 h-3 text-emerald-400" />
                                        {lead.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Audio File Upload Dropzone */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                            <span>Upload Sales Call Recording</span>
                            <span className="text-slate-400 normal-case">Supported: .mp3, .m4a, .wav, .webm, .ogg (Max 25MB)</span>
                        </label>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                                dragActive
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
                            } ${uploadMutation.isPending ? 'opacity-60 pointer-events-none' : ''}`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".mp3,.m4a,.wav,.webm,.ogg,audio/*"
                                onChange={(e) => handleFileSelected(e.target.files[0])}
                                className="hidden"
                            />

                            {uploadMutation.isPending ? (
                                <div className="space-y-3 py-4">
                                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-400 flex items-center justify-center gap-2">
                                            <Sparkles className="w-4 h-4 animate-bounce" />
                                            Google Gemini AI is processing audio recording...
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Transcribing call conversation, scoring sales technique, and generating coaching points...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mx-auto">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">
                                            <span className="text-indigo-400 font-semibold">Click to upload</span> or drag and drop audio file here
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Upload call audio to run instant Gemini AI Sales Coaching & objection analysis
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Past Recordings Selector Tabs (If multiple recordings exist) */}
                    {recordings.length > 1 && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Select Call Recording ({recordings.length} total)
                            </label>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
                                {recordings.map((rec, index) => {
                                    const isSelected = activeRecording?.unique_id === rec.unique_id;
                                    const score = rec.selling_score || 'N/A';
                                    return (
                                        <button
                                            key={rec.unique_id}
                                            onClick={() => setSelectedRecordingId(rec.unique_id)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 border transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/20'
                                                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-400'
                                            }`}
                                        >
                                            <FileAudio className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>Call #{recordings.length - index} ({rec.file_name})</span>
                                            <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-200 rounded text-[10px]">
                                                Score: {score}/10
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Active AI Coaching Analysis Panel */}
                    {isLoadingRecordings ? (
                        <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-950/40 border border-slate-800 rounded-2xl">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                            <p className="text-sm">Loading AI sales coaching records...</p>
                        </div>
                    ) : activeRecording ? (
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg">
                            {/* Score & Audio Player Banner */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-slate-800/80 pb-6">
                                {/* Selling Score Badge */}
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold border-2 shadow-lg ${
                                            getScoreBadge(activeRecording.selling_score).bg
                                        } ${getScoreBadge(activeRecording.selling_score).ring}`}
                                    >
                                        {activeRecording.selling_score ?? 'N/A'}
                                        <span className="text-xs text-slate-400 font-medium">/10</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selling Score</h4>
                                        <p className="text-sm font-bold text-slate-100 mt-0.5">
                                            {getScoreBadge(activeRecording.selling_score).label}
                                        </p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            Analyzed on {new Date(activeRecording.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Embedded Web Audio Player */}
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                            <Volume2 className="w-4 h-4 text-indigo-400" />
                                            Audio Playback: {activeRecording.file_name}
                                        </span>
                                        <span>{(activeRecording.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                    <audio
                                        controls
                                        src={activeRecording.file_url}
                                        className="w-full h-10 rounded-lg outline-none filter invert contrast-125"
                                    >
                                        Your browser does not support web audio playback.
                                    </audio>
                                </div>
                            </div>

                            {/* Strengths & Improvements Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Key Strengths */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        Key Strengths
                                    </h5>
                                    {activeRecording.strengths && activeRecording.strengths.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {activeRecording.strengths.map((str, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                                                >
                                                    ✓ {str}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500">No strengths recorded.</p>
                                    )}
                                </div>

                                {/* Areas Needed Improvement */}
                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                        Areas Needed Improvement
                                    </h5>
                                    {activeRecording.improvements && activeRecording.improvements.length > 0 ? (
                                        <ul className="space-y-1.5 text-xs text-slate-300">
                                            {activeRecording.improvements.map((imp, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-amber-400 font-bold">•</span>
                                                    <span>{imp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-500">No improvement points listed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Objection Handling & Closing Recommendations */}
                            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div>
                                    <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                        <Target className="w-4 h-4 text-indigo-400" />
                                        Objection Handling Tips
                                    </h5>
                                    {activeRecording.objection_handling && activeRecording.objection_handling.length > 0 ? (
                                        <ul className="mt-2 space-y-2 text-xs text-slate-300">
                                            {activeRecording.objection_handling.map((obj, idx) => (
                                                <li key={idx} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
                                                    {obj}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-500 mt-1">No objections recorded.</p>
                                    )}
                                </div>

                                {activeRecording.closing_recommendations && (
                                    <div className="border-t border-slate-800/80 pt-4">
                                        <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-400" />
                                            Recommended Next Steps & Closing Plan
                                        </h5>
                                        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed bg-purple-500/5 border border-purple-500/20 p-3 rounded-lg">
                                            {activeRecording.closing_recommendations}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Accordion Toggle to Expand Audio Transcript */}
                            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                                <button
                                    onClick={() => setTranscriptOpen(!transcriptOpen)}
                                    className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 transition-colors cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <FileAudio className="w-4 h-4 text-indigo-400" />
                                        Full Audio Call Transcript
                                    </span>
                                    {transcriptOpen ? (
                                        <ChevronUp className="w-4 h-4 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    )}
                                </button>

                                {transcriptOpen && (
                                    <div className="p-5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                                        {activeRecording.transcript || 'No transcript text available for this recording.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl">
                            <FileAudio className="w-10 h-10 mx-auto text-slate-600" />
                            <h4 className="text-base font-semibold text-slate-200">No recordings uploaded yet</h4>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Upload a sales call audio file (`.mp3`, `.m4a`, `.wav`, `.webm`, `.ogg`) above to transcribe the call and receive Gemini AI Sales Coaching recommendations.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between sticky bottom-0">
                    <p className="text-xs text-slate-500">
                        Powered by Google Gemini 2.5 AI Audio Intelligence
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminLeadCoachingPanelModal;
