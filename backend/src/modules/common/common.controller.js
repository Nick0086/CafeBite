import * as commonService from "./common.service.js";
import { handleError } from "../../utils/errorHelper.js";

export const fetchAllCountries = async (req, res) => {
    try {
        const result = await commonService.fetchAllCountries();
        return res.status(200).json({ success: true, message: 'Country fetched successfully', country: result });
    } catch (error) {
        handleError('common.controller.js', 'fetchAllCountries', res, error, error.message);
    }
};

export const fetchStatesByCountry = async (req, res) => {
    try {
        const { country } = req.params;
        const result = await commonService.fetchStatesByCountry(country);
        return res.status(200).json({ success: true, message: 'State fetched successfully', state: result });
    } catch (error) {
        handleError('common.controller.js', 'fetchStatesByCountry', res, error, error.message);
    }
};

export const fetchCitiesByState = async (req, res) => {
    try {
        const { state } = req.params;
        const result = await commonService.fetchCitiesByState(state);
        return res.status(200).json({ success: true, message: 'City fetched successfully', city: result });
    } catch (error) {
        handleError('common.controller.js', 'fetchCitiesByState', res, error, error.message);
    }
};

export const fetchAllCurrencies = async (req, res) => {
    try {
        const result = await commonService.fetchAllCurrencies();
        return res.status(200).json({ success: true, message: 'Currency fetched successfully', currency: result });
    } catch (error) {
        handleError('common.controller.js', 'fetchAllCurrencies', res, error, error.message);
    }
};
