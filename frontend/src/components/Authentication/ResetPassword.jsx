import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ReusableFormField } from '@/common/Form/ReusableFormField';
import PilsatingDotesLoader from '@/components/ui/loaders/PilsatingDotesLoader';
import { toastError } from '@/utils/toast-utils';
import { validateResetToken } from '@/service/auth.service';
import { authQueryKeys, passwordResetDefaultValues } from './constants/auth.constants';
import { passwordResetSchema } from './validation/auth.schema';
import { useAuthSession } from './hooks/useAuthSession';
import { usePasswordResetMutation } from './hooks/usePasswordResetMutation';

const formatErrorMessage = (error) => {
    if (error?.err?.status === 404 || error?.err?.status === 401) {
        return error?.err?.message;
    }
    return error?.err?.error || error?.err?.message || 'Something went wrong';
};

export default function ResetPasswordIndex() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { data: userData, isLoading: sessionLoading } = useAuthSession();
    const { data: verifyData, isLoading: verifyLoading, error: verifyError } = useQuery({
        queryKey: [authQueryKeys.PASSWORD_RESET, token],
        queryFn: () => validateResetToken(token),
        retry: false,
        enabled: !!token,
    });

    const [errors, setErrors] = useState({ error: false, message: '' });

    const form = useForm({
        defaultValues: passwordResetDefaultValues,
        resolver: zodResolver(passwordResetSchema),
    });

    const resetMutation = usePasswordResetMutation({
        onSuccess: () => {
            form.reset(passwordResetDefaultValues);
            setErrors({ error: false, message: '' });
        },
        onError: (error) => {
            setErrors({ error: true, message: formatErrorMessage(error) });
        },
    });

    useEffect(() => {
        if (verifyError) {
            toastError(verifyError?.response?.data?.message || "Invalid or expired token");
        }
    }, [verifyError]);

    if (sessionLoading) {
        return <FullPageLoader />;
    }

    if (userData) {
        return <Navigate to="/" replace />;
    }

    if (!token || verifyLoading || !verifyData || verifyError) {
        if (verifyError) {
            return <Navigate to="/login" replace />;
        }
        return <FullPageLoader />;
    }

    const onSubmitForm = (data) => {
        resetMutation.mutate({ newPassword: data.password, token });
    };

    const resetError = () => setErrors({ error: false, message: '' });

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-background lg:py-6">
            <Card className="w-11/12 md:w-full lg:max-w-md max-w-lg">
                <CardHeader className="pb-0">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-primary mb-2">Reset Password</h1>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-y-2'>
                            <ReusableFormField
                                control={form.control}
                                name='password'
                                type='password'
                                label='Password'
                                labelClassName='text-xs'
                                onValueChange={resetError}
                                disabled={resetMutation.isPending}
                            />

                            <ReusableFormField
                                control={form.control}
                                name='confirmPassword'
                                type='password'
                                label='Confirm Password'
                                labelClassName='text-xs'
                                onValueChange={resetError}
                                disabled={resetMutation.isPending}
                            />

                            {errors?.error && (
                                <div className='text-status-danger text-[0.8rem] font-medium'>
                                    {errors.message}
                                </div>
                            )}

                            <Button
                                className='mt-3'
                                variant='primary'
                                disabled={resetMutation.isPending}
                                isLoading={resetMutation.isPending}
                                type='submit'
                                loadingText=''
                            >
                                Submit
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function FullPageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-background lg:py-6">
            <PilsatingDotesLoader />
        </div>
    );
}
