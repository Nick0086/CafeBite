import ReusableFormField from '@/common/Form/ReusableFormField'
import { Facebook, Instagram, Phone, Twitter } from 'lucide-react'
import React from 'react'

export default function Contact({ form }) {
  return (
    <div className='space-y-4' >

      <div className="text-lg font-semibold text-gray-900 mb-4">Contact & Social Media</div>

      <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Phone size={16} className="mr-2" /> Contact Information
        </h3>
        <div className='grid grid-cols-1 gap-y-3 gap-x-6' >

          <ReusableFormField control={form.control} name='cafePhone' type='PhoneInput' required={true} label='Cafe Phone' labelClassName='text-xs' placeholder="" inputClassName='bg-white' />

          <ReusableFormField control={form.control} type={'email'} name='cafeEmail' required={true} label='Cafe Email' labelClassName='text-xs' inputClassName='bg-white' placeholder={"cafe@example.com"} />

          <ReusableFormField control={form.control} name='cafeWebsite' label='Cafe Website' labelClassName='text-xs' inputClassName='bg-white' placeholder={"https://www.cafe.com"} />
        </div>
      </div>

      <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media (Optional)</h3>
        <div className='grid grid-cols-1 gap-y-3 gap-x-6' >

          <ReusableFormField
            control={form.control}
            name='socialInstagram'
            label={<div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center mr-2">
              <Instagram size={20} className="text-pink-500" />
            </div>}
            containerClassName={'w-full flex items-center'}
            placeholder="Instagram username"
            inputClassName='bg-white'
          />

          <ReusableFormField
            control={form.control}
            name='socialFacebook'
            label={<div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-2">
              <Facebook size={20} className="text-blue-600" />
            </div>}
            containerClassName={'w-full flex items-center'}
            inputClassName='bg-white'
            placeholder={"Facebook page name"}
          />

          <ReusableFormField
            control={form.control}
            name='socialFacebook'
            label={ <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center mr-2">
              <Twitter size={20} className="text-sky-500" />
            </div>}
            containerClassName={'w-full flex items-center'}
            inputClassName='bg-white'
            placeholder={"Twitter handle"}
          />
        </div>
      </div>
    </div>
  )
}
