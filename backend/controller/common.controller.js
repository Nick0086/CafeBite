import query from "../utils/query.utils.js";
import { handleError } from "../utils/utils.js";

export const getAllCountry = async (req, res) => {
    try {

        const sql = `SELECT * FROM ucmt_tbl_country_master`;
        const result = await query(sql);
        return res.status(201).json({ message: 'Country fetched successfully', country: result });

    } catch (error) {
        handleError('common.controller.js', 'getAllCountry', res, error, error.message)
    }
}

export const getStateByCountry = async (req, res) => {
    try {

        const { country } = req.params;
        const sql = `SELECT * FROM ucmt_tbl_state_master WHERE countryid = ?`;
        const result = await query(sql, [country]);
        return res.status(201).json({ message: 'State fetched successfully', state: result });

    } catch (error) {
        handleError('common.controller.js', 'getStateByCountry', res, error, error.message)
    }
}

export const getCityByState = async (req, res) => {
    try {

        const { state } = req.params;
        const sql = `SELECT * FROM ucmt_tbl_city_master WHERE stateid = ?`;
        const result = await query(sql, [state]);
        return res.status(201).json({ message: 'City fetched successfully', city: result });

    } catch (error) {
        handleError('common.controller.js', 'getCityByState', res, error, error.message)
    }
}

export const getAllCurrency = async (req, res) => {
    try {

        const sql = `SELECT * FROM currencies`;
        const result = await query(sql);
        return res.status(201).json({ message: 'Currency fetched successfully', currency: result });

    } catch (error) {
        handleError('common.controller.js', 'getCityByState', res, error, error.message)
    }
}