import ReusableFormField from '@/common/Form/ReusableFormField'
import React from 'react'

export default function OwnerInfo({ form }) {
  return (
    <div className='grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-6' >
      <ReusableFormField control={form.control} name='first_name' required={true} label='First Name' labelClassName='text-xs' />

      <ReusableFormField control={form.control} name='last_name' required={true} label='Last Name' labelClassName='text-xs' />

      <ReusableFormField control={form.control} name='email' type='email' required={true} label='Email' labelClassName='text-xs' />

      <ReusableFormField control={form.control} name='mobile' type='PhoneInput' required={true} label='Mobile number' labelClassName='text-xs' />

      <ReusableFormField control={form.control} name='password' type='password' required={true} label='Password' labelClassName='text-xs' />
    </div>
  )
}
