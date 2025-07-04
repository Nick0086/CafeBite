import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import ReusableFormField from '@/common/Form/ReusableFormField';

// Services and Utilities
import { requestPasswordReset, verifyUserPassword } from '@/service/auth.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { useNavigate } from 'react-router';

// Constants
const INITIAL_ERROR_STATE = {
    error: false,
    message: ''
};

const LOGIN_ID_MAP = {
    EMAIL: 'email',
    MOBILE: 'sms/whatsapp'
};

export default function LoginWithPassword({
    form,
    onChangeLoginWithOption,
    loginId,
    loginType,
}) {
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);
    const navigate = useNavigate();

    const loginWithPasswordMutation = useMutation({
        mutationFn: verifyUserPassword,

        onSuccess: (res) => {
            window.localStorage.setItem('accessToken', res?.sessionId?.accessToken);
            window.localStorage.setItem('refreshToken', res?.sessionId?.refreshToken);
            toastSuccess('Login Successful');
            navigate(`/`);
        },
        onError: (error) => {
            console.error("Error in verifying login id:", error);
            toastError(`Error in verifying login id: ${JSON.stringify(error)}`);

            const errorMessage =
                error?.err?.status === 404 || error?.err?.status === 401
                    ? error?.err?.message
                    : error?.err?.error || 'Something went wrong';

            setErrors(prev => ({
                ...prev,
                error: true,
                message: errorMessage
            }));
        }
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: requestPasswordReset,
        onSuccess: () => {
            toastSuccess(`Reset Password Link Send Successfully on ${loginId}`);
        },
        onError: (error) => {
            console.error("Error in send Reset Password Link:", error);
            toastError(`Error in send Reset Password Link: ${JSON.stringify(error)}`);

            const errorMessage =
                error?.err?.status === 404 || error?.err?.status === 401
                    ? error?.err?.message
                    : error?.err?.error || 'Something went wrong';

            setErrors(prev => ({
                ...prev,
                error: true,
                message: errorMessage
            }));
        }
    });

    const onSubmitForm = (data) => {
        loginWithPasswordMutation.mutate({ ...data, loginId, loginType });
    };

    const resetError = () => {
        setErrors(INITIAL_ERROR_STATE);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-2'>
                <div>
                    <ReusableFormField
                        control={form.control}
                        name='loginId'
                        type='email'
                        label='Email'
                        labelClassName='text-xs'
                        placeholder='Email Address'
                        className='w-full'
                        disabled={loginWithPasswordMutation?.isPending || onChangeLoginWithOption.isPending || forgotPasswordMutation.isPending}
                        onValueChange={(e) => {
                            form.clearErrors('loginId');
                        }}
                    />
                </div>

                <div>
                    <ReusableFormField
                        control={form.control}
                        name='password'
                        type='password'
                        label='Password'
                        disabled={loginWithPasswordMutation?.isPending || onChangeLoginWithOption.isPending || forgotPasswordMutation.isPending}
                        labelClassName='text-xs'
                        onValueChange={resetError}
                    />

                    {errors?.error && (
                        <div className='text-status-danger text-[0.8rem] font-medium '>
                            {errors.message}
                        </div>
                    )}
                </div>

                <Button
                    className='w-full'
                    variant="primary"
                    disabled={loginWithPasswordMutation?.isPending || onChangeLoginWithOption.isPending || forgotPasswordMutation.isPending}
                    isLoading={loginWithPasswordMutation?.isPending}
                    type='submit'
                    loadingText=' '
                >
                    Sign In
                </Button>

                <div className='flex flex-row gap-2 items-center justify-between w-full'>
                    <Button
                        onClick={() => {
                            if (loginId && loginType !== '') {
                                onChangeLoginWithOption.mutate({ loginId, loginType })
                            } else {
                                //trigger error
                                form.trigger('loginId');
                            }
                        }}
                        type='button'
                        variant="none"
                        size="sm"
                        isLoading={onChangeLoginWithOption.isPending}
                        loadingText=' '
                        disabled={onChangeLoginWithOption.isPending || forgotPasswordMutation.isPending}
                        className="text-brand-primary hover:text-brand-primary-foreground font-semibold p-0"
                    >
                        Sign in using {LOGIN_ID_MAP[loginType]} OTP
                    </Button>

                    <Button
                        type='button'
                        variant="none"
                        size="sm"
                        onClick={() => {
                            if (loginId && loginType !== '') {
                                forgotPasswordMutation.mutate(loginId)
                            } else {
                                //trigger error
                                form.trigger('loginId');
                            }
                        }}
                        loadingText=' '
                        isLoading={forgotPasswordMutation.isPending}
                        disabled={onChangeLoginWithOption.isPending || forgotPasswordMutation.isPending}
                        className="text-brand-primary hover:text-brand-primary-foreground font-semibold p-0"
                    >
                        Forgot Password?
                    </Button>
                </div>
            </form>
        </Form>
    );
}