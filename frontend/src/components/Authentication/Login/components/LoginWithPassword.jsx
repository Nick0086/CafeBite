import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { toastSuccess } from '@/utils/toast-utils';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    usePasswordLoginMutation,
    useSendOtpMutation,
} from '../hooks/useLoginData';
import { requestPasswordReset } from '@/service/auth.service';
import { loginIdDisplayMap } from '../constants/login.constants';

const INITIAL_ERROR_STATE = { error: false, message: '' };

const formatError = (error) => {
    if (error?.err?.status === 404 || error?.err?.status === 401) {
        return error?.err?.message;
    }
    return error?.err?.error || error?.err?.message || 'Something went wrong';
};

function useSilentRequestPasswordResetMutation() {
    return useMutation({ mutationFn: requestPasswordReset });
}

export default function LoginWithPassword({ form, onChangeLoginWithOption, loginId, loginType }) {
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);

    const loginMutation = usePasswordLoginMutation();

    const sendOtpMutation = useSendOtpMutation({
        onSuccess: () => onChangeLoginWithOption(true),
    });

    const forgotPasswordMutation = useSilentRequestPasswordResetMutation();

    const onSubmitForm = (data) => {
        loginMutation.mutate({ ...data, loginId, loginType });
    };

    const resetError = () => setErrors(INITIAL_ERROR_STATE);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-4'>
                <div>
                    <ReusableFormField
                        control={form.control}
                        name='loginId'
                        type='email'
                        label='Email'
                        labelClassName='text-xs'
                        placeholder='Email Address'
                        className='w-full'
                        disabled={loginMutation.isPending || sendOtpMutation.isPending || forgotPasswordMutation.isPending}
                        onValueChange={() => {
                            form.clearErrors('loginId');
                            resetError();
                        }}
                    />
                </div>

                <div>
                    <ReusableFormField
                        control={form.control}
                        name='password'
                        type='password'
                        label='Password'
                        disabled={loginMutation.isPending || sendOtpMutation.isPending || forgotPasswordMutation.isPending}
                        labelClassName='text-xs'
                        onValueChange={resetError}
                    />

                    {errors?.error && (
                        <div className='text-status-danger text-[0.8rem] font-medium'>
                            {errors.message}
                        </div>
                    )}
                </div>

                <Button
                    className='h-12 w-full rounded-xl'
                    variant='primary'
                    disabled={loginMutation.isPending || sendOtpMutation.isPending || forgotPasswordMutation.isPending}
                    isLoading={loginMutation.isPending}
                    type='submit'
                    loadingText=' '
                >
                    Sign In
                </Button>

                <div className='flex w-full items-center justify-between gap-2'>
                    <Button
                        onClick={() => {
                            if (loginId && loginType !== '') {
                                sendOtpMutation.mutate({ loginId, loginType });
                            } else {
                                form.trigger('loginId');
                            }
                        }}
                        type='button'
                        variant='none'
                        size='sm'
                        isLoading={sendOtpMutation.isPending}
                        loadingText=' '
                        disabled={sendOtpMutation.isPending || forgotPasswordMutation.isPending}
                        className='min-w-0 whitespace-nowrap p-0 text-[11px] font-semibold text-brand-primary hover:text-brand-primary-foreground sm:text-xs'
                    >
                        Sign in using {loginIdDisplayMap[loginType]} OTP
                    </Button>

                    <Button
                        type='button'
                        variant='none'
                        size='sm'
                        onClick={() => {
                            if (loginId && loginType !== '') {
                                forgotPasswordMutation.mutate(loginId, {
                                    onSuccess: () => {
                                        toastSuccess(`Reset Password Link Send Successfully on ${loginId}`);
                                    },
                                    onError: (error) => setErrors({ error: true, message: formatError(error) }),
                                });
                            } else {
                                form.trigger('loginId');
                            }
                        }}
                        loadingText=' '
                        isLoading={forgotPasswordMutation.isPending}
                        disabled={sendOtpMutation.isPending || forgotPasswordMutation.isPending}
                        className='whitespace-nowrap p-0 text-[11px] font-semibold text-brand-primary hover:text-brand-primary-foreground sm:text-xs'
                    >
                        Forgot Password?
                    </Button>
                </div>
            </form>
        </Form>
    );
}
