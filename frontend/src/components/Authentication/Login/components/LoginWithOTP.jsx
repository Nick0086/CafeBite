import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { useOtpLoginMutation, useSendOtpMutation } from '../hooks/useLoginData';

const INITIAL_ERROR_STATE = { error: false, message: '' };

const RESEND_SECONDS = 60;

export default function LoginWithOTP({ form, onChangeLoginWithOption, loginId, loginType }) {
    const [errors, setErrors] = useState(INITIAL_ERROR_STATE);
    const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);

    const loginMutation = useOtpLoginMutation();
    const sendOtpMutation = useSendOtpMutation();

    const onSubmitForm = (data) => {
        loginMutation.mutate(data);
    };

    const onResendOtpHandler = async () => {
        try {
            await sendOtpMutation.mutateAsync({ loginId, loginType });
            setResendTimer(RESEND_SECONDS);
            resetError();
        } catch {
            // error already toasted by mutation
        }
    };

    const resetError = () => setErrors(INITIAL_ERROR_STATE);

    useInterval(() => {
        if (resendTimer > 0) setResendTimer((prev) => prev - 1);
    }, resendTimer > 0 ? 1000 : null);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className='flex flex-col gap-4'>
                <div>
                    <ReusableFormField
                        control={form.control}
                        name='OTP'
                        type='OTP'
                        label=''
                        labelClassName='text-xs'
                        className='w-full'
                        onValueChange={resetError}
                        disabled={loginMutation.isPending || sendOtpMutation.isPending}
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
                    type='submit'
                    loadingText=' '
                    disabled={loginMutation.isPending || sendOtpMutation.isPending}
                    isLoading={loginMutation.isPending}
                >
                    Verify
                </Button>

                <div className='flex w-full items-center justify-between gap-2'>
                    <Button
                        onClick={() => onChangeLoginWithOption(false)}
                        type='button'
                        variant='none'
                        size='sm'
                        disabled={loginMutation.isPending || sendOtpMutation.isPending}
                        className='whitespace-nowrap p-0 text-[11px] font-semibold text-brand-primary hover:text-brand-primary-foreground sm:text-xs'
                    >
                        Sign in using password
                    </Button>

                    {resendTimer > 0 ? (
                        <span className='text-secondary text-sm font-semibold'>
                            Resend in {resendTimer}s
                        </span>
                    ) : (
                        <Button
                            type='button'
                            variant='none'
                            size='sm'
                            className='whitespace-nowrap p-0 text-[11px] font-semibold text-brand-primary hover:text-brand-primary-foreground sm:text-xs'
                            onClick={onResendOtpHandler}
                            loadingText=' '
                            disabled={loginMutation.isPending || sendOtpMutation.isPending}
                            isLoading={sendOtpMutation.isPending}
                        >
                            Resend OTP
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
