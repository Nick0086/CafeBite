import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cafeBasicFormSchema, cafeContactFormSchema, cafeLocationFormSchema, personalFormSchema } from '../schema'
import { getStepIcon, getStepLabel, queryKeyLoopUp, registerFormDefaultValues } from '../utils'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from "lucide-react";
import OwnerInfo from './OwnerInfo'
import CafeInfo from './CafeInfo'
import Location from './Location'
import Contact from './Contact'
import { useNavigate } from 'react-router'
import { registerUser } from '@/service/user.service'
import { toastError, toastSuccess } from '@/utils/toast-utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { checkUserSession } from '@/service/auth.service'
import PulsatingDots from '@/components/ui/loaders/PulsatingDots'

const formSchema = z.object({
  ...personalFormSchema.shape,
  ...cafeBasicFormSchema.shape,
  ...cafeLocationFormSchema.shape,
  ...cafeContactFormSchema.shape,
})

export default function Registration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1)
  const [logoPreview, setLogoPreview] = useState(null)

  const { data: userData,isLoading: userViolation,isFetching  } = useQuery({
    queryKey: [queryKeyLoopUp['LOGIN']],
    queryFn: checkUserSession,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: registerFormDefaultValues,
  })

  const firstName = form.watch('firstName')
  const lastName = form.watch('lastName')

  const validateCurrentStep = async () => {
    let isValid = false

    switch (step) {
      case 1:
        isValid = await form.trigger(["firstName", "lastName", "email", "phoneNumber", "password"])
        break
      case 2:
        isValid = await form.trigger(["cafeName", "cafeDescription", "cafeLogo"])
        break
      case 3:
        isValid = await form.trigger(["cafeAddress", "cafeCity", "cafeCountry", "cafeCurrency", "cafeState", "cafeZip"])
        break
      case 4:
        isValid = await form.trigger(["cafePhone"])
        break
      default:
        isValid = false
    }
    return isValid
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) return;

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit form when step is 4 and valid
      form.handleSubmit(onSubmitForm)();
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const registerUserMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toastSuccess(`Registertion Of ${firstName} ${lastName} successfully`);
      navigate('/login');
      form.reset(registerFormDefaultValues);
    },
    onError: (error) => {
      console.log(`Error in Registertion of ${firstName} ${lastName}`, error);
      toastError(`Error in registertion of ${firstName} ${lastName}: ${error.err.message}`)
    }
  })

  const onSubmitForm = (data) => {
    // console.log('Registration -> onSubmitForm', data)
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value)
    }
    registerUserMutation.mutate(formData)
  }

  useEffect(() => {
    if(userData){
      navigate('/')
    }
  }, [userData])

  if (userViolation || isFetching || userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface-background">
        <PulsatingDots size={5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 md:py-8 py-4 bg-surface-background">
      <Card className="w-full max-w-lg shadow border-0 overflow-hidden">
        <CardHeader className="bg-white border-b py-3">
          <div className="text-center space-y-1.5">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Join Our Digital Menu Platform</CardTitle>
            <CardDescription className="text-gray-500">
              Create your cafe profile and start showcasing your menu online
            </CardDescription>
          </div>
        </CardHeader>

        <div className="relative">
          <div className="flex items-center justify-between px-4 py-4">
            {[1, 2, 3, 4].map((stepNumber) => {
              const { Icon, iconClass, textClass } = getStepIcon(stepNumber, step)
              return (
                <div key={stepNumber} className="flex flex-col items-center z-10 ">
                  <div className={`${iconClass} transition-all duration-300 ease-linear cursor-pointer`} onClick={() => {
                    if (stepNumber < step) {
                      setStep(stepNumber)
                    } else if (stepNumber > step) {
                      validateCurrentStep().then(isValid => {
                        if (isValid) setStep(stepNumber)
                      })
                    }
                  }}>
                    {<Icon size={18} />}
                  </div>
                  <span className={textClass}>{getStepLabel(stepNumber)}</span>
                </div>
              )
            })}
          </div>
          <div className="absolute top-1/2 -translate-y-[300%] left-0 right-0">
            <div className='px-6 ' >
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
              {step === 1 && <OwnerInfo form={form} isDisabled={registerUserMutation?.isPending} />}
              {step === 2 && <CafeInfo form={form} logoPreview={logoPreview} setLogoPreview={setLogoPreview} isDisabled={registerUserMutation?.isPending} />}
              {step === 3 && <Location form={form} isDisabled={registerUserMutation?.isPending} />}
              {step === 4 && <Contact form={form} isDisabled={registerUserMutation?.isPending} />}
            </div>

            <CardFooter className="flex justify-between gap-4 px-6 py-3 border-t bg-gray-50">
              <Button variant="outline" type="button" disabled={step === 1 || registerUserMutation?.isPending} className='shadow-none' onClick={handleBack}>
                <ChevronLeft size={16} className="mr-2" /> Back
              </Button>

              {step < 4 ? (
                <Button type="button" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleNext}>
                  Next <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button type="button" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={registerUserMutation?.isPending} isLoading={registerUserMutation?.isPending} onClick={handleNext} >
                  Submit
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}