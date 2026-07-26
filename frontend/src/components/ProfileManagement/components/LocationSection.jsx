import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { ReusableFormField } from '@/common/Form/ReusableFormField';
import { useCountries, useStates, useCities, useCurrencies } from '../hooks/useLocationQueries';

const toOptions = (items, labelKey, valueKey) =>
    items?.map((item) => ({ label: item[labelKey], value: item[valueKey] }));

export default function LocationSection({ form, isDisabled }) {
    const country = form.watch('cafeCountry');
    const state = form.watch('cafeState');

    const { data: countryData, isLoading: countryLoading } = useCountries();
    const { data: statesData, isLoading: stateLoading } = useStates(country);
    const { data: cityData, isLoading: cityLoading } = useCities(state);
    const { data: currencyData, isLoading: currencyLoading } = useCurrencies();

    const countryOptions = toOptions(countryData?.country, 'country', 'id');
    const stateOptions = toOptions(statesData?.state, 'state', 'id');
    const cityOptions = toOptions(cityData?.city, 'city', 'id');
    const currencyOptions = currencyData?.currency?.map((c) => ({
        label: `${c.name} (${c.symbol})`,
        value: c.code,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin size={20} className="text-purple-600" />
                    Location Information
                </CardTitle>
                <CardDescription>
                    Your cafe&apos;s physical location and address details
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ReusableFormField
                    control={form.control}
                    name='cafeAddress'
                    type='textarea'
                    required={true}
                    label='Street Address'
                    placeholder="Street Address"
                    disabled={isDisabled}
                />

                <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                    <ReusableFormField
                        control={form.control}
                        type='combobox'
                        name='cafeCountry'
                        required={true}
                        label='Country'
                        isLoading={countryLoading}
                        options={countryOptions}
                        disabled={isDisabled}
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
                        isLoading={stateLoading}
                        options={stateOptions}
                        disabled={isDisabled}
                        onValueChange={() => form.setValue('cafeCity', '')}
                    />
                    <ReusableFormField
                        control={form.control}
                        type='combobox'
                        name='cafeCity'
                        required={true}
                        label='City'
                        isLoading={cityLoading}
                        options={cityOptions}
                        disabled={isDisabled}
                    />
                </div>

                <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                    <ReusableFormField
                        control={form.control}
                        name='cafeZip'
                        required={true}
                        label='ZIP/Postal Code'
                        placeholder="ZIP/Postal Code"
                        disabled={isDisabled}
                    />
                    <ReusableFormField
                        control={form.control}
                        type='combobox'
                        name='cafeCurrency'
                        required={true}
                        label='Currency'
                        isLoading={currencyLoading}
                        options={currencyOptions}
                        disabled={isDisabled}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
