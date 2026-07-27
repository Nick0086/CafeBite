import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
        <div className="min-h-screen flex items-center justify-center bg-surface-background">
            <Card className="w-11/12 md:w-full max-w-md">
                <CardHeader className="pb-0">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-primary mb-2">Sign in</h1>
                        <p className="text-secondary mx-auto text-sm md:max-w-[85%] max-w-[90%]">
                            to access your account.
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className='space-y-4'>
                        {isLoginWithOTP && (
                            <div className="flex items-center justify-between w-fit gap-2 py-1 px-2 border border-input rounded-md">
                                <span className='w-fit px-2'>{loginId}</span>
                                <Button
                                    type='button'
                                    variant='none'
                                    size='sm'
                                    className="text-brand-primary font-semibold"
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

                        <p className="text-center text-sm text-secondary mt-4">
                            Don&apos;t have an account yet?{' '}
                            <Link to='/register-user' className="text-brand-primary hover:text-brand-primary-foreground">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}