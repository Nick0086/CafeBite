import ReusableFormField from '@/common/Form/ReusableFormField'
import { getAllCountry, getAllCurrency, getCityByState, getStateByCountry } from '@/service/common.service';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo } from 'react'
import { queryKeyLoopUp } from '../utils';
import { toast } from 'react-toastify';

export default function CafeInfo({ form }) {

  const country = form.watch('country_id');
  const state = form.watch('state_id');

  const { data : countryData, isLoading : countryDataIsLoading, error : countryDataError } = useQuery({
    queryKey: [queryKeyLoopUp['COUNTRY']],
    queryFn: getAllCountry,
  });

  const { data : statesData, isLoading : stateDataIsLoading, error : stateDataError } = useQuery({
    queryKey: [queryKeyLoopUp['STATE'], country],
    queryFn: () => getStateByCountry(country),
    enabled: !!country
  });

  const { data : CityData, isLoading : cityDataIsLoading, error : cityDataError } = useQuery({
    queryKey: [queryKeyLoopUp['CITY'], state],
    queryFn:() => getCityByState(state),
    enabled: !!state
  });

  const { data : currencyData, isLoading : currencyDataIsLoading, error : currencyDataError } = useQuery({
    queryKey: [queryKeyLoopUp['CURRENCY']],
    queryFn: getAllCurrency,
  });


  useEffect(() => {
      if(countryDataError){
        toast.error(`Failed to fetch country data ${countryDataError.message}`)
      }
      if(stateDataError){
        toast.error(`Failed to fetch state data ${stateDataError.message}`)
      }
      if(cityDataError){
        toast.error(`Failed to fetch city data ${cityDataError.message}`)
      }
      if(currencyDataError){
        toast.error(`Failed to fetch currency data ${currencyDataError.message}`)
      }
  }, [countryDataError, stateDataError, cityDataError, currencyDataError])
  
  const countryOptions = useMemo(() => {
    if(!countryData ) return
    return countryData?.country?.map((country) => ({
      label: country.country,
      value: country.id,
    }));
  }, [countryData]);

  const stateOptions = useMemo(() => {
    if(!statesData ) return
    return statesData?.state?.map((state) => ({
      label: state.state,
      value: state.id,
    }));
  }, [statesData]);

  const cityOptions = useMemo(() => {
    if(!CityData ) return
    return CityData?.city?.map((city) => ({
      label: city.city,
      value: city.id,
    }));
  }, [CityData]);

  const currencyOptions = useMemo(() => {
    if(!currencyData ) return
    return currencyData?.currency?.map((currency) => ({
      label: `${currency.name}(${currency.symbol})`,
      value: currency.code,
    }));
  }, [currencyData]);

  

  return (
    <div className='space-y-3' >
      <div>
        <ReusableFormField control={form.control} name='cafe_name' required={true} label='Cafe Name' labelClassName='text-xs' />
      </div>

      <div className='space-y-3' >
        <ReusableFormField control={form.control} name='address_line1' type={'textarea'} required={true} label='Address Line 1' labelClassName='text-xs' />
        <ReusableFormField control={form.control} name='address_line2' type={'textarea'} label='Address Line 2' labelClassName='text-xs' />
      </div>
      
      <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-3 gap-x-6' >
        <ReusableFormField control={form.control} type={'combobox'} name='country_id' required={true} label='Country' labelClassName='text-xs' isLoading={countryDataIsLoading} options={countryOptions} />

        <ReusableFormField control={form.control} type={'combobox'} name='state_id' required={true} label='State' labelClassName='text-xs' isLoading={stateDataIsLoading} options={stateOptions} />
        
        <ReusableFormField control={form.control} type={'combobox'} name='city_id' required={true} label='City' labelClassName='text-xs' isLoading={cityDataIsLoading} options={cityOptions} />

        <ReusableFormField control={form.control} name='postal_code' required={true} label='Posatal Code' labelClassName='text-xs' />
        
        <ReusableFormField control={form.control} type={'combobox'} name='currency_code' required={true} label='Currency' labelClassName='text-xs' isLoading={currencyDataIsLoading} options={currencyOptions} />
      </div>
    </div>
  )
}
