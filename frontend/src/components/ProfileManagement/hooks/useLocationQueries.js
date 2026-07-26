import { useQuery } from "@tanstack/react-query";
import { getAllCountry, getAllCurrency, getCityByState, getStateByCountry } from "@/service/common.service";
import { authQueryKeys } from "@/components/Authentication/constants/auth.constants";

export function useCountries() {
    return useQuery({
        queryKey: [authQueryKeys.COUNTRY],
        queryFn: getAllCountry,
    });
}

export function useStates(country) {
    return useQuery({
        queryKey: [authQueryKeys.STATE, country],
        queryFn: () => getStateByCountry(country),
        enabled: !!country,
    });
}

export function useCities(state) {
    return useQuery({
        queryKey: [authQueryKeys.CITY, state],
        queryFn: () => getCityByState(state),
        enabled: !!state,
    });
}

export function useCurrencies() {
    return useQuery({
        queryKey: [authQueryKeys.CURRENCY],
        queryFn: getAllCurrency,
    });
}
