import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { User } from 'lucide-react';

export default function OwnerInfo({ form, isDisabled }) {
  return (
    <div className='space-y-4'>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Personal Information</p>
          <p className="text-xs text-secondary">Your account credentials</p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-4'>
        <ReusableFormField
          control={form.control}
          name='firstName'
          required={true}
          label='First Name'
          labelClassName='text-xs font-medium text-secondary'
          placeholder="First Name"
          isDisabled={isDisabled}
        />
        <ReusableFormField
          control={form.control}
          name='lastName'
          required={true}
          label='Last Name'
          labelClassName='text-xs font-medium text-secondary'
          placeholder="Last Name"
          isDisabled={isDisabled}
        />
        <ReusableFormField
          control={form.control}
          name='email'
          type='email'
          required={true}
          label='Email Address'
          className='md:col-span-2'
          labelClassName='text-xs font-medium text-secondary'
          placeholder="your@email.com"
          isDisabled={isDisabled}
        />
        <ReusableFormField
          control={form.control}
          name='phoneNumber'
          type='PhoneInput'
          required={true}
          label='Mobile Number'
          className='md:col-span-2'
          labelClassName='text-xs font-medium text-secondary'
          isDisabled={isDisabled}
        />
        <ReusableFormField
          control={form.control}
          name='password'
          type='password'
          required={true}
          label='Password'
          className='md:col-span-2'
          labelClassName='text-xs font-medium text-secondary'
          placeholder='Create a strong password'
          isDisabled={isDisabled}
        />
        <div className='md:col-span-2 flex items-start gap-1.5'>
          <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
          <p className='text-xs text-gray-400 leading-relaxed'>
            Minimum 8 characters with uppercase, lowercase, and a number.
          </p>
        </div>
      </div>
    </div>
  );
}
