import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { getAllCountry, getStateByCountry, getCityByState } from '@/service/common.service';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { authQueryKeys } from '../../constants/registration.constants';

export default function Location({ form, isDisabled }) {
  const state = form.watch('cafeState');

  // ── 1. Fetch Countries dynamically ──────────────────────────────────────
  const { data: countryData } = useQuery({
    queryKey: [authQueryKeys.COUNTRY],
    queryFn: getAllCountry,
    staleTime: Infinity,
  });

  // Find India's ID from the fetched country list (handles 1 vs 101 dynamically)
  const indiaCountryId = useMemo(() => {
    if (!countryData?.country) return null;
    const india = countryData.country.find(
      (c) => c.country?.toLowerCase() === 'india'
    );
    return india ? india.id : null;
  }, [countryData]);

  // ── 2. Fetch States based on resolved India ID ───────────────────────────
  const { data: statesData, isLoading: stateDataIsLoading } = useQuery({
    queryKey: [authQueryKeys.STATE, indiaCountryId],
    queryFn: () => getStateByCountry(indiaCountryId),
    enabled: !!indiaCountryId,
    staleTime: Infinity,
  });

  // ── 3. Fetch Cities based on selected State ──────────────────────────────
  const { data: cityData, isLoading: cityDataIsLoading } = useQuery({
    queryKey: [authQueryKeys.CITY, state],
    queryFn: () => getCityByState(state),
    enabled: !!state,
    staleTime: Infinity,
  });

  // ── 4. Set Country and Currency in the background ────────────────────────
  useEffect(() => {
    if (indiaCountryId) {
      form.setValue('cafeCountry', indiaCountryId, { shouldValidate: false });
    }
    form.setValue('cafeCurrency', 'INR', { shouldValidate: false });
  }, [form, indiaCountryId]);

  // Reset city when state changes
  const handleStateChange = () => {
    form.setValue('cafeCity', '');
  };

  const stateOptions = useMemo(
    () => statesData?.state?.map((s) => ({ label: s.state, value: s.id })),
    [statesData],
  );

  const cityOptions = useMemo(
    () => cityData?.city?.map((c) => ({ label: c.city, value: c.id })),
    [cityData],
  );

  return (
    <div className='space-y-4'>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <MapPin size={14} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Cafe Location</p>
          <p className="text-xs text-secondary">Where your cafe is located in India</p>
        </div>
      </div>

      <div className="bg-indigo-50/30 rounded-xl border border-indigo-100/70 p-4">
        <div className='grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-4'>

          {/* Street Address */}
          <ReusableFormField
            control={form.control}
            name='cafeAddress'
            type='textarea'
            required={true}
            label='Street Address'
            labelClassName='text-xs font-medium text-secondary'
            placeholder="Building / Street / Area"
            className='md:col-span-2'
            inputClassName='bg-white resize-none'
            isDisabled={isDisabled}
          />

          {/* State */}
          <ReusableFormField
            control={form.control}
            type='combobox'
            name='cafeState'
            required={true}
            label='State'
            labelClassName='text-xs font-medium text-secondary'
            isLoading={stateDataIsLoading || !indiaCountryId}
            options={stateOptions}
            onValueChange={handleStateChange}
            isDisabled={isDisabled || !indiaCountryId}
          />

          {/* City */}
          <ReusableFormField
            control={form.control}
            type='combobox'
            name='cafeCity'
            required={true}
            label='City'
            labelClassName='text-xs font-medium text-secondary'
            isLoading={cityDataIsLoading}
            options={cityOptions}
            isDisabled={isDisabled || !state}
          />

          {/* ZIP */}
          <ReusableFormField
            control={form.control}
            name='cafeZip'
            required={true}
            label='PIN / Postal Code'
            labelClassName='text-xs font-medium text-secondary'
            placeholder="e.g. 400001"
            className='md:col-span-2'
            inputClassName='bg-white'
            isDisabled={isDisabled}
          />
        </div>

        {/* India info badge */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-indigo-500 font-medium">
          <span>🇮🇳</span>
          <span>India · Currency set to INR automatically</span>
        </div>
      </div>
    </div>
  );
}
