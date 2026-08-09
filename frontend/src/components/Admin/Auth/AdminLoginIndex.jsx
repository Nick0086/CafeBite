import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { verifyTotpPin } from '@/service/adminAuth.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

export function AdminLoginIndex() {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
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
            toastError(error?.err?.message || 'Invalid code. Please try again.');
            setPin(['', '', '', '', '', '']);
            if (inputRefs.current[0]) inputRefs.current[0].focus();
        },
    });

    const handleDigitChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pasted)) {
            setPin(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullPin = pin.join('');
        if (fullPin.length !== 6) {
            toastError('Please enter the complete 6-digit TOTP code');
            return;
        }
        verifyMutation.mutate(fullPin);
    };

    const isSubmitting = verifyMutation.isPending;
    const pinFilled = pin.join('').length === 6;

    return (
        <div className="min-h-screen min-h-dvh bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Brand mark */}
            <div className="mb-6 flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                CafeBite Admin
            </div>

            {/* Card */}
            <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Admin Access</h1>
                    <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                        Enter your 6-digit Google Authenticator code to continue
                    </p>
                </div>

                {/* PIN Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Digit Inputs */}
                    <div
                        className="flex justify-between items-center gap-2 sm:gap-3"
                        onPaste={handlePaste}
                    >
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
                                aria-label={`Digit ${idx + 1}`}
                                className={`
                                    flex-1 aspect-square max-w-[52px]
                                    text-center text-xl sm:text-2xl font-bold
                                    rounded-xl border transition-all duration-150
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                                    disabled:opacity-50 select-none
                                    ${digit
                                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10'
                                        : 'bg-slate-950/70 border-slate-700 text-slate-100 focus:border-indigo-500'
                                    }
                                `}
                            />
                        ))}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !pinFilled}
                        className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <span>Verify Access</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Hint */}
                <div className="mt-6 flex items-start gap-2.5 p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                    <Smartphone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Open <span className="text-indigo-300 font-semibold">Google Authenticator</span> on your phone and enter the current 6-digit code for <span className="text-slate-200">CafeBite Admin</span>.
                    </p>
                </div>

                {/* Footer Security Notice */}
                <div className="mt-5 flex items-center justify-center gap-2 text-slate-600 text-[11px]">
                    <Lock className="w-3 h-3" />
                    <span>TOTP RFC 6238 · 256-bit Encrypted</span>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginIndex;
