import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { Facebook, Globe, Instagram, Phone, Twitter } from 'lucide-react';

function SocialIcon({ children, bg }) {
  return (
    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mr-2`}>
      {children}
    </div>
  );
}

export default function Contact({ form, isDisabled }) {
  return (
    <div className='space-y-4'>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <Phone size={14} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Contact & Social Media</p>
          <p className="text-xs text-secondary">How customers can reach you</p>
        </div>
      </div>

      {/* Contact Info box */}
      <div className="bg-indigo-50/30 rounded-xl border border-indigo-100/70 p-4">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Phone size={12} className="text-indigo-500" />
          Contact Information
        </h3>
        <div className='grid grid-cols-1 gap-y-3'>
          <ReusableFormField
            control={form.control}
            name='cafePhone'
            type='PhoneInput'
            required={true}
            label='Cafe Phone'
            labelClassName='text-xs font-medium text-secondary'
            inputClassName='bg-white'
            isDisabled={isDisabled}
          />

          <ReusableFormField
            control={form.control}
            type='email'
            name='cafeEmail'
            label='Cafe Email'
            labelClassName='text-xs font-medium text-secondary'
            inputClassName='bg-white'
            placeholder="cafe@example.com"
            isDisabled={isDisabled}
          />

          <ReusableFormField
            control={form.control}
            name='cafeWebsite'
            label='Cafe Website'
            labelClassName='text-xs font-medium text-secondary'
            inputClassName='bg-white'
            placeholder="https://www.yourcafe.com"
            isDisabled={isDisabled}
          />
        </div>
      </div>

      {/* Social Media box */}
      <div className="bg-gray-50/60 rounded-xl border border-gray-100 p-4">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
          Social Media{' '}
          <span className="normal-case font-normal text-gray-400">(optional)</span>
        </h3>
        <div className='grid grid-cols-1 gap-y-3'>
          <ReusableFormField
            control={form.control}
            name='socialInstagram'
            label={
              <SocialIcon bg="bg-pink-50">
                <Instagram size={16} className="text-pink-500" />
              </SocialIcon>
            }
            isDisabled={isDisabled}
            containerClassName='w-full flex items-center'
            placeholder="Instagram username"
            inputClassName='bg-white'
          />

          <ReusableFormField
            control={form.control}
            name='socialFacebook'
            label={
              <SocialIcon bg="bg-blue-50">
                <Facebook size={16} className="text-blue-600" />
              </SocialIcon>
            }
            isDisabled={isDisabled}
            containerClassName='w-full flex items-center'
            inputClassName='bg-white'
            placeholder="Facebook page name"
          />

          <ReusableFormField
            control={form.control}
            name='socialTwitter'
            label={
              <SocialIcon bg="bg-sky-50">
                <Twitter size={16} className="text-sky-500" />
              </SocialIcon>
            }
            isDisabled={isDisabled}
            containerClassName='w-full flex items-center'
            inputClassName='bg-white'
            placeholder="Twitter / X handle"
          />
        </div>
      </div>
    </div>
  );
}
