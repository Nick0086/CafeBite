import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { Coffee, ImagePlus } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function CafeInfo({ form, logoPreview, setLogoPreview, isDisabled }) {
  const fileInputRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("cafeLogo", file);
      const reader = new FileReader();
      reader.onload = () => {
        if (mountedRef.current) setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasLogoError = !!form?.formState?.errors?.cafeLogo;

  return (
    <div className='space-y-4'>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <Coffee size={14} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Basic Cafe Information</p>
          <p className="text-xs text-secondary">Tell customers about your cafe</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-y-3'>
        {/* Logo Upload */}
        <div className="flex flex-col items-center justify-center">
          <div
            onClick={triggerFileInput}
            className={[
              "group relative w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer",
              "transition-all duration-200 overflow-hidden",
              hasLogoError
                ? "border-red-300 bg-red-50"
                : logoPreview
                  ? "border-indigo-200 bg-white hover:border-indigo-400"
                  : "border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-400",
            ].join(' ')}
          >
            {logoPreview ? (
              <>
                <img
                  src={logoPreview}
                  alt="Cafe logo preview"
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ImagePlus size={20} className="text-white" />
                </div>
              </>
            ) : (
              <>
                <ImagePlus size={22} className="text-indigo-400 group-hover:text-indigo-600 transition-colors mb-1" />
                <span className="text-[10px] text-indigo-400 group-hover:text-indigo-600 font-medium transition-colors">
                  Upload Logo
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoChange}
            disabled={isDisabled}
            className="hidden"
            accept="image/png, image/jpeg, image/jpg, image/webp"
          />
          <span className="text-[10px] text-gray-400 mt-1.5">
            PNG, JPG · 400×400px recommended
          </span>
          {hasLogoError && (
            <span className="text-xs text-red-500 mt-1">
              {form?.formState?.errors?.cafeLogo?.message}
            </span>
          )}
        </div>

        <ReusableFormField
          control={form.control}
          name='cafeName'
          required={true}
          label='Cafe Name'
          labelClassName='text-xs font-medium text-secondary'
          placeholder="e.g. Café Delicioso"
          isDisabled={isDisabled}
        />

        <ReusableFormField
          control={form.control}
          type='textarea'
          name='cafeDescription'
          required={true}
          label='Cafe Description'
          labelClassName='text-xs font-medium text-secondary'
          inputClassName='bg-white resize-none'
          placeholder="Tell customers about your cafe, specialties, and atmosphere..."
          isDisabled={isDisabled}
        />
      </div>
    </div>
  );
}
