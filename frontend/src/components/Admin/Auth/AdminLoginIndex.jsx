import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { verifyTotpPin } from '@/service/adminAuth.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

export function AdminLoginIndex() {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Auto-focus first input box on load
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const verifyMutation = useMutation({
        mutationFn: verifyTotpPin,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminSession'] });
            toastSuccess(data?.message || 'Admin authentication successful');
            navigate('/admin/leads', { replace: true });
        },
        onError: (error) => {
            toastError(error?.err?.message || 'Invalid verification code. Please try again.');
            setPin(['', '', '', '', '', '']);
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        },
    });

    const handleDigitChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);

        // Auto advance to next input field
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setPin(digits);
            if (inputRefs.current[5]) {
                inputRefs.current[5].focus();
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullPin = pin.join('');
        if (fullPin.length !== 6) {
            toastError('Please enter a complete 6-digit TOTP code');
            return;
        }
        verifyMutation.mutate(fullPin);
    };

    const isSubmitting = verifyMutation.isPending;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Decorative Gradients */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
                {/* Header Badge */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Admin Portal Access</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Enter your 6-digit Google Authenticator code
                    </p>
                </div>

                {/* PIN Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
                        {pin.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                disabled={isSubmitting}
                                className="w-12 h-14 text-center text-xl font-bold text-indigo-300 bg-slate-950 border border-slate-700/80 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || pin.join('').length !== 6}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Verifying Code...</span>
                            </div>
                        ) : (
                            <>
                                <span>Verify Access</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Security Notice */}
                <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex items-center justify-center gap-2 text-slate-500 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Protected by 256-bit TOTP RFC 6238 Encryption</span>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginIndex;
