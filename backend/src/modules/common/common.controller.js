import * as commonService from "./common.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const fetchAllCountries = asyncHandler(async (req, res) => {
    const result = await commonService.fetchAllCountries();
    return res.status(200).json({ success: true, message: 'Country fetched successfully', country: result });
});

export const fetchStatesByCountry = asyncHandler(async (req, res) => {
    const { country } = req.params;
    const result = await commonService.fetchStatesByCountry(country);
    return res.status(200).json({ success: true, message: 'State fetched successfully', state: result });
});

export const fetchCitiesByState = asyncHandler(async (req, res) => {
    const { state } = req.params;
    const result = await commonService.fetchCitiesByState(state);
    return res.status(200).json({ success: true, message: 'City fetched successfully', city: result });
});

export const fetchAllCurrencies = asyncHandler(async (req, res) => {
    const result = await commonService.fetchAllCurrencies();
    return res.status(200).json({ success: true, message: 'Currency fetched successfully', currency: result });
});
