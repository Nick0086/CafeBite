import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// Components
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginWithPassword from './components/LoginWithPassword';
import LoginWithOTP from './components/LoginWithOTP';
import { useMutation, useQuery } from '@tanstack/react-query';
import { checkUserSession, sendOneTimePassword } from '@/service/auth.service';
import { toastError, toastSuccess } from '@/utils/toast-utils';
import { Link, useNavigate } from 'react-router';
import { DEFAULT_VALUES, queryKeyLoopUp } from './utils';
import { VALIDATION_SCHEMAS } from './schema';
import PilsatingDotesLoader from '../ui/loaders/PilsatingDotesLoader';


export default function Login() {
  const navigate = useNavigate();
  const [isLoginWithOTP, setIsLoginWithOTP] = useState(false);

  const { data: userData, isLoading: userViolation, isFetching } = useQuery({
    queryKey: [queryKeyLoopUp['LOGIN']],
    queryFn: checkUserSession,
  });

  const loginPasswordForm = useForm({
    defaultValues: DEFAULT_VALUES.password,
    resolver: yupResolver(VALIDATION_SCHEMAS.password)
  });

  const loginOTPForm = useForm({
    defaultValues: DEFAULT_VALUES.otp,
    resolver: yupResolver(VALIDATION_SCHEMAS.otp)
  });

  const loginId = loginPasswordForm.watch('loginId');
  const loginType = loginPasswordForm.watch('loginType');

  const onChangeLoginWithOption = (isTrue) => {
    loginPasswordForm.setValue("password", DEFAULT_VALUES.password.password);
    loginOTPForm.reset(DEFAULT_VALUES.otp);
    setIsLoginWithOTP(isTrue);
  };

  const resetForms = () => {
    loginPasswordForm.reset(DEFAULT_VALUES.password);
    loginOTPForm.reset(DEFAULT_VALUES.otp);
    setIsLoginWithOTP(false);
  };

  const sendOTPMutation = useMutation({
    mutationFn: sendOneTimePassword,
    onSuccess: () => {
      toastSuccess(`OTP sent successfully :- ${loginId}`)
      onChangeLoginWithOption(true)
    },
    onError: (error) => {
      toastError(`Error in Send OTP to ${loginId} : ${JSON.stringify(error)}`);
    }
  })

  useEffect(() => {
    if (userData) {
      navigate('/')
    }
  }, [userData])

  if (userViolation || isFetching || userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-background">
        <PilsatingDotesLoader />
      </div>
    );
  }

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
          {/* {!isLoginIdVerified && (
            <LoginIdVerifier
              form={loginIdForm}
              setIsLoginIdVerified={setIsLoginIdVerified}
            />
          )} */}


          <div className='space-y-4'>
            {isLoginWithOTP ? (<div className="flex items-center justify-between w-fit gap-2 py-1 px-2 border border-input rounded-md">
              <span className='w-fit px-2'>{loginId}</span>
              <Button
                type='button'
                variant="none"
                size="sm"
                className="text-brand-primary font-semibold"
                onClick={resetForms}
              >
                Change
              </Button>
            </div>) : null}

            {!isLoginWithOTP && (
              <LoginWithPassword
                form={loginPasswordForm}
                loginId={loginId}
                loginType={loginType}
                onChangeLoginWithOption={sendOTPMutation}
              />
            )}

            {isLoginWithOTP && (
              <LoginWithOTP
                form={loginOTPForm}
                loginId={loginId}
                loginType={loginType}
                onChangeLoginWithOption={onChangeLoginWithOption}
                sendOTPMutation={sendOTPMutation}
              />
            )}

            <p className="text-center text-sm text-secondary mt-4">
              Don't have an account yet?{' '}
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