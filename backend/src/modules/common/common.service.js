import * as commonRepository from "./common.repository.js";

export const fetchAllCountries = async () => {
    return await commonRepository.fetchAllCountries();
};

export const fetchStatesByCountry = async (country) => {
    return await commonRepository.fetchStatesByCountry(country);
};

export const fetchCitiesByState = async (state) => {
    return await commonRepository.fetchCitiesByState(state);
};

export const fetchAllCurrencies = async () => {
    return await commonRepository.fetchAllCurrencies();
};
