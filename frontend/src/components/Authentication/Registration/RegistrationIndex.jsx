import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

  const validateCurrentStep = async () => {
    const fields = stepFieldMap[step];
    if (!fields) return false;
    return form.trigger(fields);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

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
    <div className="min-h-[100dvh] flex justify-center bg-gray-50 md:py-8 py-4 bg-surface-background">
      <div>
        <Card className="w-full max-w-lg shadow border-0 overflow-hidden">
          <CardHeader className="bg-white border-b py-3">
            <div className="text-center space-y-1.5">
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                Join Our Digital Menu Platform
              </CardTitle>
              <CardDescription className="text-gray-500">
                Create your cafe profile and start showcasing your menu online
              </CardDescription>
            </div>
          </CardHeader>

          <div className="relative">
            <div className="flex items-center justify-between px-4 py-4">
              {[1, 2, 3, 4].map((stepNumber) => {
                const { Icon, iconClass, textClass } = getStepIcon(stepNumber, step);
                return (
                  <div key={stepNumber} className="flex flex-col items-center z-10">
                    <div
                      className={`${iconClass} transition-all duration-300 ease-linear cursor-pointer`}
                      onClick={async () => {
                        if (stepNumber < step) {
                          setStep(stepNumber);
                        } else if (stepNumber > step) {
                          const isValid = await validateCurrentStep();
                          if (isValid) setStep(stepNumber);
                        }
                      }}
                    >
                      {<Icon size={18} />}
                    </div>
                    <span className={textClass}>{getStepLabel(stepNumber)}</span>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-1/2 -translate-y-[300%] left-0 right-0">
              <div className='px-6'>
                <div className="h-1 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-linear"
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)}>
              <div className='px-4 pb-3'>
                {step === 1 && <OwnerInfo form={form} isDisabled={registerMutation.isPending} />}
                {step === 2 && (
                  <CafeInfo
                    form={form}
                    logoPreview={logoPreview}
                    setLogoPreview={setLogoPreview}
                    isDisabled={registerMutation.isPending}
                  />
                )}
                {step === 3 && <Location form={form} isDisabled={registerMutation.isPending} />}
                {step === 4 && <Contact form={form} isDisabled={registerMutation.isPending} />}
              </div>
              <p className="text-center text-sm text-secondary my-2">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-primary hover:text-brand-primary-foreground">
                  Sign in
                </Link>
              </p>
              <CardFooter className="flex justify-between gap-4 px-6 py-3 border-t bg-gray-50">
                <Button
                  variant="outline"
                  type="button"
                  disabled={step === 1 || registerMutation.isPending}
                  className="shadow-none"
                  onClick={handleBack}
                >
                  <ChevronLeft size={16} className="mr-2" /> Back
                </Button>

                {step < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleNext}
                  >
                    Next <ChevronRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={registerMutation.isPending}
                    isLoading={registerMutation.isPending}
                    onClick={handleNext}
                  >
                    Submit
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
