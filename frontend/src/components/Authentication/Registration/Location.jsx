import ReusableFormField from '@/common/Form/ReusableFormField'
import { getAllCountry, getAllCurrency, getCityByState, getStateByCountry } from '@/service/common.service';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo } from 'react'
import { queryKeyLoopUp } from '../utils';
import { toast } from 'react-toastify';
import { MapPin } from 'lucide-react';

export default function Location({ form , isDisabled}) {

  const country = form.watch('cafeCountry');
  const state = form.watch('cafeState');

  const { data: countryData, isLoading: countryDataIsLoading, error: countryDataError } = useQuery({
    queryKey: [queryKeyLoopUp['COUNTRY']],
    queryFn: getAllCountry,
  });

  const { data: statesData, isLoading: stateDataIsLoading, error: stateDataError } = useQuery({
    queryKey: [queryKeyLoopUp['STATE'], country],
    queryFn: () => getStateByCountry(country),
    enabled: !!country
  });

  const { data: CityData, isLoading: cityDataIsLoading, error: cityDataError } = useQuery({
    queryKey: [queryKeyLoopUp['CITY'], state],
    queryFn: () => getCityByState(state),
    enabled: !!state
  });

  const { data: currencyData, isLoading: currencyDataIsLoading, error: currencyDataError } = useQuery({
    queryKey: [queryKeyLoopUp['CURRENCY']],
    queryFn: getAllCurrency,
  });


  useEffect(() => {
    if (countryDataError) {
      toast.error(`Failed to fetch country data ${countryDataError.message}`)
    }
    if (stateDataError) {
      toast.error(`Failed to fetch state data ${stateDataError.message}`)
    }
    if (cityDataError) {
      toast.error(`Failed to fetch city data ${cityDataError.message}`)
    }
    if (currencyDataError) {
      toast.error(`Failed to fetch currency data ${currencyDataError.message}`)
    }
  }, [countryDataError, stateDataError, cityDataError, currencyDataError])

  const countryOptions = useMemo(() => {
    if (!countryData) return
    return countryData?.country?.map((country) => ({
      label: country.country,
      value: country.id,
    }));
  }, [countryData]);

  const stateOptions = useMemo(() => {
    if (!statesData) return
    return statesData?.state?.map((state) => ({
      label: state.state,
      value: state.id,
    }));
  }, [statesData]);

  const cityOptions = useMemo(() => {
    if (!CityData) return
    return CityData?.city?.map((city) => ({
      label: city.city,
      value: city.id,
    }));
  }, [CityData]);

  const currencyOptions = useMemo(() => {
    if (!currencyData) return
    return currencyData?.currency?.map((currency) => ({
      label: `${currency.name}(${currency.symbol})`,
      value: currency.code,
    }));
  }, [currencyData]);

  return (
    <div className='space-y-4' >
      <div className="text-lg font-semibold text-gray-900 mb-4">Location</div>
      <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <MapPin size={16} className="mr-2" /> Cafe Location
        </h3>
        <div className='grid md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-6' >
          <ReusableFormField control={form.control} name='cafeAddress' type='textarea' required={true} label='Street Address' labelClassName='text-xs' placeholder="Street Address" className='md:col-span-2' inputClassName='bg-white' isDisabled={isDisabled} />

          <ReusableFormField control={form.control} type={'combobox'} name='cafeCountry' required={true} label='Country' labelClassName='text-xs' isLoading={countryDataIsLoading} options={countryOptions} isDisabled={isDisabled}
          onValueChange={(value) => {
            form.setValue('cafeState', '')
            form.setValue('cafeCity', '')
          }} />

          <ReusableFormField control={form.control} type={'combobox'} name='cafeState' required={true} label='State' labelClassName='text-xs' isLoading={stateDataIsLoading} options={stateOptions} onValueChange={(value) => { form.setValue('cafeCity', '') }} isDisabled={isDisabled} />

          <ReusableFormField control={form.control} type={'combobox'} name='cafeCity' required={true} label='City' labelClassName='text-xs' isLoading={cityDataIsLoading} options={cityOptions} isDisabled={isDisabled} />

          <ReusableFormField control={form.control} type={'combobox'} name='cafeCurrency' required={true} label='Currency' labelClassName='text-xs' isLoading={currencyDataIsLoading} options={currencyOptions} isDisabled={isDisabled} />

          <ReusableFormField control={form.control} name='cafeZip' required={true} label='ZIP/Postal Code' labelClassName='text-xs' placeholder="Last Name" className='md:col-span-2' inputClassName='bg-white' isDisabled={isDisabled} />
        </div>
      </div>
    </div>

  )
}
