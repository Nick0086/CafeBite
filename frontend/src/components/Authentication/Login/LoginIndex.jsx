import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router';
import { loginSchemas } from './validation/login.schema';
import { loginDefaultValues } from './constants/login.constants';
import { useAuthSession } from '../hooks/useAuthSession';
import PilsatingDotesLoader from '@/components/ui/loaders/PilsatingDotesLoader';
import LoginWithPassword from './components/LoginWithPassword';
import LoginWithOTP from './components/LoginWithOTP';
import CafeIcon from '@/assets/SVG/coffee-cup-coffee.svg?react';

export default function LoginIndex() {
    const { data: userData, isLoading } = useAuthSession();
    const [isLoginWithOTP, setIsLoginWithOTP] = useState(false);

    const passwordForm = useForm({
        defaultValues: loginDefaultValues.password,
        resolver: zodResolver(loginSchemas.password),
    });
    const otpForm = useForm({
        defaultValues: loginDefaultValues.otp,
        resolver: zodResolver(loginSchemas.otp),
    });

    const loginId = passwordForm.watch('loginId');
    const loginType = passwordForm.watch('loginType');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-surface-background">
                <PilsatingDotesLoader />
            </div>
        );
    }

    if (userData) {
        return <Navigate to="/" replace />;
    }

    const resetForms = () => {
        passwordForm.reset(loginDefaultValues.password);
        otpForm.reset(loginDefaultValues.otp);
        setIsLoginWithOTP(false);
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#f7f8fc] px-3 py-4 sm:px-6 sm:py-8">
            <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[400px] flex-col justify-center sm:min-h-0 lg:max-w-[420px]">
                <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(30,41,59,0.08)]">
                    <div className="border-b border-slate-100 px-4 pb-4 pt-4 sm:px-8 sm:pb-4 sm:pt-5">
                        <div className="mb-4 flex items-center justify-between sm:mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 shadow-sm shadow-indigo-100 sm:h-9 sm:w-9 sm:rounded-xl">
                                    <CafeIcon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                                </div>
                                <span className="text-sm font-bold tracking-tight text-slate-900">CafeBite</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Welcome back</span>
                        </div>
                        <h1 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[28px]">
                            Sign in to CafeBite
                        </h1>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                            Manage your cafe menu and connect with more customers.
                        </p>
                    </div>

                    <div className="px-4 py-4 sm:px-8 sm:py-5">
                        <div className='space-y-5'>
                        {isLoginWithOTP && (
                            <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm">
                                <span className='min-w-0 truncate font-medium text-slate-700'>{loginId}</span>
                                <Button
                                    type='button'
                                    variant='none'
                                    size='sm'
                                    className="h-9 rounded-lg px-3 font-semibold text-indigo-600 hover:bg-white hover:text-indigo-800"
                                    onClick={resetForms}
                                >
                                    Change
                                </Button>
                            </div>
                        )}

                        {!isLoginWithOTP && (
                            <Form {...passwordForm}>
                                <LoginWithPassword
                                    form={passwordForm}
                                    loginId={loginId}
                                    loginType={loginType}
                                    onChangeLoginWithOption={setIsLoginWithOTP}
                                />
                            </Form>
                        )}

                        {isLoginWithOTP && (
                            <Form {...otpForm}>
                                <LoginWithOTP
                                    form={otpForm}
                                    loginId={loginId}
                                    loginType={loginType}
                                    onChangeLoginWithOption={setIsLoginWithOTP}
                                />
                            </Form>
                        )}

                        <p className="pt-1 text-center text-sm text-slate-500">
                            Don&apos;t have an account yet?{' '}
                            <Link to='/register-user' className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-800 hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                    </div>
                </div>
                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                    Secure access to your cafe dashboard
                </p>
            </div>
        </div>
    );
}
