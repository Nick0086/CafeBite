import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { deleteAdminLead } from '@/service/adminLeads.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

export function AdminLeadDeleteDialog({ open, lead = null, onClose }) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: deleteAdminLead,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
            toastSuccess(res?.message || 'Lead profile removed');
            onClose();
        },
        onError: (err) => {
            toastError(err?.message || err?.err?.message || 'Failed to delete lead');
        },
    });

    const handleDelete = () => {
        if (!lead?.unique_id) return;
        deleteMutation.mutate(lead.unique_id);
    };

    if (!open || !lead) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
                {/* Header / Warning Icon */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-100">Delete Restaurant Lead?</h3>
                            <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={deleteMutation.isPending}
                        className="p-1 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Lead Summary Info */}
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                    <p className="text-xs font-medium text-slate-400">Target Restaurant:</p>
                    <p className="text-sm font-bold text-slate-100">{lead.restaurant_name}</p>
                    <p className="text-xs text-slate-400">
                        {lead.city} • {lead.phone}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-2 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        <span>Confirm Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminLeadDeleteDialog;
