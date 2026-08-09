import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, BrainCircuit, Building2, MapPin, PhoneCall, Sparkles, RefreshCw, FileAudio } from 'lucide-react';
import { fetchAdminLeadRecordings, uploadAdminLeadRecording } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';
import { AudioDropzone } from './AudioDropzone';
import { RecordingSelector } from './RecordingSelector';
import { AudioPlayer } from './AudioPlayer';
import { CoachingInsights } from './CoachingInsights';

export function LeadCoachingModal({ open, lead, onClose }) {
    const queryClient = useQueryClient();
    const [selectedRecordingId, setSelectedRecordingId] = useState(null);

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

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md">
            <div className="
                w-full bg-slate-900 border-t sm:border border-slate-800
                rounded-t-3xl sm:rounded-2xl shadow-2xl
                flex flex-col
                max-h-[95dvh] sm:max-h-[90vh]
                sm:max-w-3xl sm:mx-4
                overflow-hidden
            ">
                {/* Mobile Handle */}
                <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-slate-700" />
                </div>

                {/* Header */}
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
                                    <a href={`tel:${lead.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1 text-emerald-400 font-medium">
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

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                    <AudioDropzone
                        onFileSelected={(file) => uploadMutation.mutate(file)}
                        isPending={uploadMutation.isPending}
                    />

                    <RecordingSelector
                        recordings={recordings}
                        activeRecordingId={activeRecording?.unique_id}
                        onSelectRecording={setSelectedRecordingId}
                    />

                    {isLoadingRecordings ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2 text-slate-400 bg-slate-950/40 border border-slate-800 rounded-2xl">
                            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                            <p className="text-sm">Loading coaching records...</p>
                        </div>
                    ) : activeRecording ? (
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden p-4 sm:p-5 space-y-4">
                            <AudioPlayer activeRecording={activeRecording} />
                            <CoachingInsights activeRecording={activeRecording} />
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

                {/* Footer */}
                <div className="px-4 sm:px-6 py-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
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

export default LeadCoachingModal;
