import ReusableFormField from '@/common/Form/ReusableFormField'
import { Upload } from 'lucide-react'
import React, { useRef } from 'react'

export default function CafeInfo({ form, logoPreview, setLogoPreview }) {

  const fileInputRef = useRef(null);


  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("cafeLogo", file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className='space-y-4' >

      <div className="text-lg font-semibold text-gray-900 mb-4">Basic Cafe Information</div>
      <div className='grid grid-cols-1 gap-y-3 gap-x-6' >

        <div className="flex flex-col items-center justify-center mb-6">
          <div onClick={triggerFileInput} className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-2 overflow-hidden">
            {logoPreview ? (
              <img
                src={logoPreview || "/placeholder.svg"}
                alt="Cafe logo preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Upload size={24} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Upload Logo</span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoChange}
            className="hidden"
            accept="image/png, image/jpeg, image/jpg, image/webp"
          />
          <span className="text-xs text-gray-500">Recommended: 400x400px</span>
          {form?.formState?.errors?.cafeLogo && (
            <span className="text-xs text-red-500 mt-1">
              {form?.formState?.errors?.cafeLogo?.message}
            </span>
          )}

        </div>

        <ReusableFormField control={form.control} name='cafeName' required={true} label='Cafe Name' labelClassName='text-xs' placeholder="Cafe Delicious" />

        <ReusableFormField control={form.control} type={'textarea'} name='cafeDescription' required={true} label='Cafe Description' labelClassName='text-xs' inputClassName='bg-white' placeholder="Tell customers about your cafe, specialties, and atmosphere..." />
      </div>
    </div>
  )
}
