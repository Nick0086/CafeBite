import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { getAllCountry, getAllCurrency, getCityByState, getStateByCountry } from '@/service/common.service';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { authQueryKeys } from '../../constants/auth.constants';

export default function Location({ form, isDisabled }) {
  const country = form.watch('cafeCountry');
  const state = form.watch('cafeState');

  const { data: countryData, isLoading: countryDataIsLoading } = useQuery({
    queryKey: [authQueryKeys.COUNTRY],
    queryFn: getAllCountry,
  });

  const { data: statesData, isLoading: stateDataIsLoading } = useQuery({
    queryKey: [authQueryKeys.STATE, country],
    queryFn: () => getStateByCountry(country),
    enabled: !!country,
  });

  const { data: cityData, isLoading: cityDataIsLoading } = useQuery({
    queryKey: [authQueryKeys.CITY, state],
    queryFn: () => getCityByState(state),
    enabled: !!state,
  });

  const { data: currencyData, isLoading: currencyDataIsLoading } = useQuery({
    queryKey: [authQueryKeys.CURRENCY],
    queryFn: getAllCurrency,
  });

  const countryOptions = useMemo(
    () => countryData?.country?.map((c) => ({ label: c.country, value: c.id })),
    [countryData],
  );
  const stateOptions = useMemo(
    () => statesData?.state?.map((s) => ({ label: s.state, value: s.id })),
    [statesData],
  );
  const cityOptions = useMemo(
    () => cityData?.city?.map((c) => ({ label: c.city, value: c.id })),
    [cityData],
  );
  const currencyOptions = useMemo(
    () => currencyData?.currency?.map((c) => ({ label: `${c.name}(${c.symbol})`, value: c.code })),
    [currencyData],
  );

  return (
    <div className='space-y-4'>
      <div className="text-lg font-semibold text-gray-900 mb-4">Location</div>
      <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MapPin size={16} className="mr-2" /> Cafe Location
        </h3>
        <div className='grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-6'>
          <ReusableFormField
            control={form.control}
            name='cafeAddress'
            type='textarea'
            required={true}
            label='Street Address'
            labelClassName='text-xs'
            placeholder="Street Address"
            className='md:col-span-2'
            inputClassName='bg-white'
            isDisabled={isDisabled}
          />

          <ReusableFormField
            control={form.control}
            type='combobox'
            name='cafeCountry'
            required={true}
            label='Country'
            labelClassName='text-xs'
            isLoading={countryDataIsLoading}
            options={countryOptions}
            isDisabled={isDisabled}
            onValueChange={() => {
              form.setValue('cafeState', '');
              form.setValue('cafeCity', '');
            }}
          />

          <ReusableFormField
            control={form.control}
            type='combobox'
            name='cafeState'
            required={true}
            label='State'
            labelClassName='text-xs'
            isLoading={stateDataIsLoading}
            options={stateOptions}
            onValueChange={() => form.setValue('cafeCity', '')}
            isDisabled={isDisabled}
          />

          <ReusableFormField
            control={form.control}
            type='combobox'
            name='cafeCity'
            required={true}
            label='City'
            labelClassName='text-xs'
            isLoading={cityDataIsLoading}
            options={cityOptions}
            isDisabled={isDisabled}
          />

          <ReusableFormField
            control={form.control}
            type='combobox'
            name='cafeCurrency'
            required={true}
            label='Currency'
            labelClassName='text-xs'
            isLoading={currencyDataIsLoading}
            options={currencyOptions}
            isDisabled={isDisabled}
          />

          <ReusableFormField
            control={form.control}
            name='cafeZip'
            required={true}
            label='ZIP/Postal Code'
            labelClassName='text-xs'
            placeholder="ZIP/Postal Code"
            className='md:col-span-2'
            inputClassName='bg-white'
            isDisabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
}
