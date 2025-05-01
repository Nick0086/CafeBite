import ReusableFormField from '@/common/Form/ReusableFormField'
import React from 'react'

export default function OwnerInfo({ form }) {
  return (
    <div className='space-y-4' >
      <div className="text-lg font-semibold text-gray-900 mb-4">Personal Information</div>
      <div className='grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-6' >
        <ReusableFormField control={form.control} name='firstName' required={true} label='First Name' labelClassName='text-xs'
          placeholder="First Name" />

        <ReusableFormField control={form.control} name='lastName' required={true} label='Last Name' labelClassName='text-xs' placeholder="Last Name" />

        <ReusableFormField control={form.control} name='email' type='email' required={true} label='Email' className='md:col-span-2' labelClassName='text-xs' placeholder="your@email.com" />

        <ReusableFormField control={form.control} name='phoneNumber' type='PhoneInput' required={true} label='Mobile number' className='md:col-span-2' labelClassName='text-xs' />

        <ReusableFormField control={form.control} name='password' type='password' required={true} label='Password' className='md:col-span-2' labelClassName='text-xs' placeholder={'*******'} />

        <p className='md:col-span-2 text-xs text-gray-400 font-medium' >Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, and one number.</p>
      </div>
    </div>
  )
}
