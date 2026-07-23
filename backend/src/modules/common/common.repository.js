import query from "../../utils/query.utils.js";

export const fetchAllCountries = async (connection = null) => {
    const sql = `SELECT * FROM ucmt_tbl_country_master`;
    return await query(sql, [], connection);
};

export const fetchStatesByCountry = async (country, connection = null) => {
    const sql = `SELECT * FROM ucmt_tbl_state_master WHERE countryid = ?`;
    return await query(sql, [country], connection);
};

export const fetchCitiesByState = async (state, connection = null) => {
    const sql = `SELECT * FROM ucmt_tbl_city_master WHERE stateid = ?`;
    return await query(sql, [state], connection);
};

export const fetchAllCurrencies = async (connection = null) => {
    const sql = `SELECT * FROM currencies`;
    return await query(sql, [], connection);
};
