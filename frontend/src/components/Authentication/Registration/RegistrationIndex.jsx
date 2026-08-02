import { zodResolver } from '@hookform/resolvers/zod';
import { useState, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, Link } from 'react-router';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import PilsatingDotesLoader from '@/components/ui/loaders/PilsatingDotesLoader';
import {
  getStepIcon,
  getStepLabel,
  registerFormDefaultValues,
  stepFieldMap,
} from './constants/registration.constants';
import { fullProfileSchema } from '@/common/validation/profile.schemas';
import OwnerInfo from './components/RegistrationForm/OwnerInfo';
import CafeInfo from './components/RegistrationForm/CafeInfo';
import Location from './components/RegistrationForm/Location';
import Contact from './components/RegistrationForm/Contact';
import { useAuthSession } from '../hooks/useAuthSession';
import { useRegisterMutation } from './hooks/useRegistrationData';
import SmartMenuLogo from '@/assets/SVG/smart-menu-logo.svg?react';

const TOTAL_STEPS = 4;

export default function RegistrationIndex() {
  const { data: userData, isLoading, isError } = useAuthSession();
  const [step, setStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const form = useForm({
    resolver: zodResolver(fullProfileSchema),
    defaultValues: registerFormDefaultValues,
  });

  const registerMutation = useRegisterMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-background">
        <PilsatingDotesLoader />
      </div>
    );
  }

  if (!isError && userData) {
    return <Navigate to="/" replace />;
  }

  const validateStep = async (s) => {
    const fields = stepFieldMap[s];
    if (!fields) return false;
    return form.trigger(fields);
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (!isValid) return;
    setCompletedSteps((prev) => new Set([...prev, step]));
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      form.handleSubmit(onSubmitForm)();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStepClick = async (stepNumber) => {
    if (stepNumber < step) {
      setStep(stepNumber);
      return;
    }

    if (stepNumber > step) {
      for (let currentStep = step; currentStep < stepNumber; currentStep += 1) {
        const valid = await validateStep(currentStep);
        if (!valid) {
          setStep(currentStep);
          return;
        }
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }
      setStep(stepNumber);
    }
  };

  const onSubmitForm = (data) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    }
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f7f8fc] px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[620px] flex-col sm:min-h-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(30,41,59,0.08)] sm:min-h-[720px]">
          <div className="flex-shrink-0 border-b border-slate-100 px-4 pb-3 pt-4 sm:px-8 sm:pb-5 sm:pt-8">
            <div className="mb-2 flex items-center justify-between sm:mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 shadow-sm shadow-indigo-100 sm:h-9 sm:w-9 sm:rounded-xl">
                  <SmartMenuLogo className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                </div>
                <span className="text-sm font-bold tracking-tight text-slate-900">SmartMenu</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Step {step} of {TOTAL_STEPS}</span>
            </div>
            <h1 className="text-xl font-bold leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl">
              Set up your business
            </h1>
            <p className="mt-1 hidden max-w-md text-sm leading-6 text-slate-500 sm:block sm:mt-2">
              Create your profile and put your menu in front of more customers.
            </p>
          </div>

          <div className="flex-shrink-0 border-b border-slate-100 px-4 py-3 sm:px-8 sm:py-5">
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100 sm:mb-4">
              <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${(completedSteps.size / TOTAL_STEPS) * 100}%` }} />
            </div>
            <div className="flex items-start w-full">
              {[1, 2, 3, 4].map((stepNumber, idx) => {
                const { Icon, iconClass, textClass } = getStepIcon(stepNumber, step);
                const isCompleted = completedSteps.has(stepNumber);
                return (
                  <Fragment key={stepNumber}>
                    {/* Step Node (Circle + Label) */}
                    <div className="flex flex-col items-center flex-shrink-0 relative">
                      <button
                        type="button"
                        className={[
                          iconClass,
                          'transition-all duration-300 ease-out cursor-pointer',
                          'scale-90 hover:scale-95 active:scale-90 sm:scale-100 sm:hover:scale-105 sm:active:scale-95 z-10',
                          stepNumber === step
                            ? 'shadow-[0_0_0_4px_rgba(99,102,241,0.15)]'
                            : '',
                        ].join(' ')}
                        aria-label={`Go to ${getStepLabel(stepNumber)}`}
                        onClick={() => handleStepClick(stepNumber)}
                      >
                        <Icon size={16} strokeWidth={stepNumber === step ? 2.5 : 2} />
                      </button>
                      <span className={[
                        textClass,
                        'hidden text-[10px] font-semibold mt-1.5 whitespace-nowrap text-center transition-colors duration-300 sm:block',
                      ].join(' ')}>
                        {getStepLabel(stepNumber)}
                      </span>
                    </div>

                    {/* Connector line segment */}
                    {idx < 3 && (
                      <div className="flex-1 h-0.5 mx-1 bg-slate-100 rounded-full overflow-hidden self-start mt-4 sm:mx-2 sm:mt-5 flex-shrink-0">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: isCompleted ? '100%' : '0%',
                           background: '#4f46e5',
                          }}
                        />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitForm)}
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-8 sm:py-7">
                {step === 1 && (
                  <OwnerInfo form={form} isDisabled={registerMutation.isPending} />
                )}
                {step === 2 && (
                  <CafeInfo
                    form={form}
                    logoPreview={logoPreview}
                    setLogoPreview={setLogoPreview}
                    isDisabled={registerMutation.isPending}
                  />
                )}
                {step === 3 && (
                  <Location form={form} isDisabled={registerMutation.isPending} />
                )}
                {step === 4 && (
                  <Contact form={form} isDisabled={registerMutation.isPending} />
                )}
              </div>

              <div className="flex-shrink-0 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-8 sm:py-4">
                <p className="mb-2 text-center text-xs text-slate-500 sm:mb-3">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-800 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={step === 1 || registerMutation.isPending}
                    className="h-12 w-12 flex-shrink-0 rounded-xl border-slate-200 p-0 text-slate-600 shadow-none hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto sm:px-5"
                    onClick={handleBack}
                  >
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">Back</span>
                  </Button>

                  {step < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="h-12 flex-1 gap-1 rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.99]"
                    >
                      Next
                      <ChevronRight size={15} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={registerMutation.isPending}
                      onClick={handleNext}
                      className="h-12 flex-1 gap-2 rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-70"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        'Submit'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>

        <p className="mt-3 flex-shrink-0 text-center text-[11px] leading-5 text-slate-400">
          By creating an account you agree to our{' '}
          <span className="text-indigo-500 cursor-pointer hover:underline">Terms of Service</span>
          {' '}·{' '}
          <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
