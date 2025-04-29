import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerFormSchema } from '../schema'
import { registerFormDefaultValues } from '../utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Coffee, User } from 'lucide-react'
import OwnerInfo from './OwnerInfo'
import CafeInfo from './CafeInfo'

export default function Registration() {
  const [currentStep, setCurrentStep] = useState(0);
  const progressContainerRef = useRef(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const steps = [
    { id: 'account', label: 'Account', icon: <User className="w-6 h-6 text-inherit" /> },
    { id: 'cafe', label: 'Cafe', icon: <Coffee className="w-6 h-6 text-inherit" /> }
  ]

  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: registerFormDefaultValues,
  })

  const onSubmitForm = (data) => {
    console.log('Registration -> onSubmitForm', data)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    if (progressContainerRef.current) {
      const containerWidth = progressContainerRef.current.offsetWidth;
      const width = currentStep === 0 ? 0 : containerWidth;
      setProgressWidth(width);
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 md:py-8 py-4 bg-surface-background">
      <div className="2xl:5/12 lg:w-6/12 md:w-10/12 w-11/12">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Digital Menu Platform</h1>
          <p className="text-gray-600 mx-auto text-sm md:max-w-[85%] max-w-[90%]">
            Create your cafe profile and start showcasing your menu online
          </p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-0 pt-4">
            <div>
              <h4 className="text-gray-800 text-lg font-semibold flex items-center gap-1">
                <Coffee size={20} className="text-indigo-600" />Cafe Owner Registration
              </h4>
              <p className="text-gray-500 text-xs">Complete the form below to register your cafe on our platform</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Steps with progress line */}
            <div className="flex items-center justify-between mb-8 px-0 relative">

              <div ref={progressContainerRef} className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full mx-10"></div>

              {/* Active progress line */}
              <div className="absolute top-6 left-0 h-2 bg-indigo-600 rounded-full mx-10 transition-all duration-300" style={{ width: `${progressWidth}px` }}></div>

              {/* Step icons */}
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center z-10">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2 z-10 ${index <= currentStep ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>{step.icon}</div>
                  <span className={`text-sm ${index <= currentStep ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>{step.label}</span>
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitForm)} className="flex flex-col gap-y-4">
                {currentStep === 0 && (
                  <>
                    <h3 className=" font-semibold text-gray-800 mb-2">Personal Information</h3>
                    <OwnerInfo form={form} />
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <h3 className="font-semibold text-gray-800 mb-2">Cafe Information</h3>
                    <CafeInfo form={form} />
                  </>
                )}

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" className="border-indigo-300 text-indigo-600" onClick={prevStep} disabled={currentStep === 0}>Back</Button>

                  {currentStep < steps.length - 1 ? (
                    <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={nextStep}>Next</Button>
                  ) : (
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit</Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}