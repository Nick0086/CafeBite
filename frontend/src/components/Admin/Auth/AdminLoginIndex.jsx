import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Lock, ArrowRight, Smartphone, Loader2 } from 'lucide-react';
import { verifyTotpPin } from '@/service/adminAuth.service';
import { toastSuccess, toastError } from '@/utils/toast-utils';

// OTP Digit Input
function OtpDigit({ value, inputRef, onChange, onKeyDown, onPaste, disabled, index, isFilled }) {
    return (
        <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            disabled={disabled}
            aria-label={`Authentication code digit ${index + 1}`}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            className={[
                'w-10 h-11 rounded-lg border text-center text-base font-bold',
                'transition-all duration-150 select-none outline-none',
                'focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                isFilled
                    ? 'bg-indigo-500/10 border-indigo-500/60 text-indigo-200 shadow-sm shadow-indigo-500/10'
                    : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500',
            ].join(' ')}
        />
    );
}

// Main Component
export function AdminLoginIndex() {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [hasError, setHasError] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (!hasError) return;
        const t = setTimeout(() => setHasError(false), 1500);
        return () => clearTimeout(t);
    }, [hasError]);

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
            setHasError(true);
            inputRefs.current[0]?.focus();
        },
    });

    const handleDigitChange = (index, e) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) return;
        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length > 0) {
            const newPin = [...pin];
            pasted.split('').forEach((digit, i) => {
                if (i < 6) newPin[i] = digit;
            });
            setPin(newPin);
            inputRefs.current[Math.min(pasted.length, 5)]?.focus();
        }
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
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
        <div className="h-dvh bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="mb-5 flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold tracking-widest uppercase select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                CafeBite Admin
            </div>

            <div
                role="main"
                className={[
                    'relative z-10 w-full max-w-[340px]',
                    'bg-slate-900/80 backdrop-blur-xl',
                    'border rounded-2xl shadow-2xl shadow-black/40',
                    'p-6 sm:p-7',
                    'transition-all duration-300',
                    hasError
                        ? 'border-red-500/50 ring-1 ring-red-500/20'
                        : 'border-slate-800/80',
                ].join(' ')}
            >
                <header className="flex flex-col items-center text-center mb-5">
                    <div
                        aria-hidden="true"
                        className="mb-3 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-violet-500/15 border border-indigo-500/25 shadow-inner shadow-indigo-500/10"
                    >
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">
                        Two-Factor Authentication
                    </h1>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-[220px]">
                        Enter your 6-digit Google Authenticator code
                    </p>
                </header>

                <form onSubmit={handleSubmit} noValidate>
                    <fieldset className="flex justify-center gap-2 mb-4" aria-label="6-digit authentication code">
                        <legend className="sr-only">Enter your 6-digit authentication code</legend>
                        {pin.map((digit, idx) => (
                            <OtpDigit
                                key={idx}
                                index={idx}
                                value={digit}
                                isFilled={!!digit}
                                disabled={isSubmitting}
                                inputRef={(el) => (inputRefs.current[idx] = el)}
                                onChange={(e) => handleDigitChange(idx, e)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                onPaste={handlePaste}
                            />
                        ))}
                    </fieldset>

                    {hasError && (
                        <p role="alert" className="text-center text-xs text-red-400 mb-3 animate-pulse">
                            Invalid code — please try again
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !pinFilled}
                        className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/20 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <span>Verify Access</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-4 flex items-start gap-2 p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Open <span className="text-indigo-300 font-medium">Google Authenticator</span> on your phone and enter the code for <span className="text-slate-300 font-medium">CafeBite Admin</span>.
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-600 text-[10px]">
                    <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>TOTP . RFC 6238 . 256-bit Encrypted</span>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginIndex;