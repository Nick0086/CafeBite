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
    /*
     * Full-viewport layout — the card fills the screen.
     * No page-level scroll. Only the form body scrolls internally.
     */
    <div
      className="h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-4"
      style={{ background: 'hsl(231 100% 99%)' }}
    >
      <div className="w-full max-w-[560px] h-full max-h-[820px] flex flex-col">

        {/* ── Card ─────────────────────────────────────────── */}
        <div
          className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(79,107,237,0.10)', border: '1px solid rgba(99,102,241,0.10)' }}
        >

          {/* ── Card Header ── */}
          <div className="flex-shrink-0 border-b border-indigo-50 px-6 pt-5 pb-4">
            <div className="text-center space-y-0.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-primary leading-tight">
                Join Our Digital Menu Platform
              </h1>
              <p className="text-xs text-secondary leading-relaxed">
                Create your cafe profile and start showcasing your menu online
              </p>
            </div>
          </div>

          {/* ── Step Indicator ── */}
          <div className="flex-shrink-0 px-8 pt-5 pb-4 border-b border-gray-50">
            <div className="flex items-start w-full">
              {[1, 2, 3, 4].map((stepNumber, idx) => {
                const { Icon, iconClass, textClass } = getStepIcon(stepNumber, step);
                const isCompleted = completedSteps.has(stepNumber);
                return (
                  <Fragment key={stepNumber}>
                    {/* Step Node (Circle + Label) */}
                    <div className="flex flex-col items-center flex-shrink-0 relative">
                      <div
                        className={[
                          iconClass,
                          'transition-all duration-300 ease-out cursor-pointer',
                          'hover:scale-105 active:scale-95 z-10',
                          stepNumber === step
                            ? 'shadow-[0_0_0_4px_rgba(99,102,241,0.15)]'
                            : '',
                        ].join(' ')}
                        title={getStepLabel(stepNumber)}
                        onClick={async () => {
                          if (stepNumber < step) {
                            setStep(stepNumber);
                          } else if (stepNumber > step) {
                            let ok = true;
                            for (let s = step; s < stepNumber; s++) {
                              const valid = await validateStep(s);
                              if (!valid) {
                                if (s !== step) setStep(s);
                                ok = false;
                                break;
                              }
                              setCompletedSteps((prev) => new Set([...prev, s]));
                            }
                            if (ok) setStep(stepNumber);
                          }
                        }}
                      >
                        <Icon size={16} strokeWidth={stepNumber === step ? 2.5 : 2} />
                      </div>
                      <span className={[
                        textClass,
                        'text-[10px] font-semibold mt-1.5 whitespace-nowrap text-center transition-colors duration-300',
                      ].join(' ')}>
                        {getStepLabel(stepNumber)}
                      </span>
                    </div>

                    {/* Connector line segment */}
                    {idx < 3 && (
                      <div className="flex-1 h-[2px] mx-2 bg-gray-100 rounded-full overflow-hidden self-start mt-5 flex-shrink-0">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: isCompleted ? '100%' : '0%',
                            background: 'linear-gradient(90deg,#6366f1,#4f6bed)',
                          }}
                        />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          {/* ── Scrollable Form Body ── */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitForm)}
              className="flex-1 min-h-0 flex flex-col"
            >
              {/* Scrollable content — only THIS area scrolls */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-1">
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

              {/* ── Pinned Footer ── */}
              <div className="flex-shrink-0 border-t border-indigo-50 bg-gray-50/60 px-6 py-3">
                {/* Sign-in link */}
                <p className="text-center text-xs text-secondary mb-3">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-brand-primary font-semibold hover:text-brand-primary-foreground transition-colors hover:underline underline-offset-2"
                  >
                    Sign in
                  </Link>
                </p>

                {/* Nav buttons */}
                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={step === 1 || registerMutation.isPending}
                    className="shadow-none border-gray-200 text-secondary hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all gap-1 rounded-lg px-4"
                    onClick={handleBack}
                  >
                    <ChevronLeft size={15} />
                    Back
                  </Button>

                  {step < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="gap-1 rounded-lg px-6 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg,#4f6bed 0%,#6366f1 100%)' }}
                    >
                      Next
                      <ChevronRight size={15} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      disabled={registerMutation.isPending}
                      onClick={handleNext}
                      className="gap-2 rounded-lg px-6 font-semibold text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                      style={{ background: 'linear-gradient(135deg,#4f6bed 0%,#6366f1 100%)' }}
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

        {/* ── Bottom legal ── */}
        <p className="text-center text-[10px] text-gray-400 mt-2 flex-shrink-0">
          By creating an account you agree to our{' '}
          <span className="text-indigo-500 cursor-pointer hover:underline">Terms of Service</span>
          {' '}·{' '}
          <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
