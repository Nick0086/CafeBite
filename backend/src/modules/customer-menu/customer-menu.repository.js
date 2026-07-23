/*
    Database Schema (references)
    ============================
    tables: unique_id, client_id, template_id, table_number, status
    clients: unique_id, logo_url, currency_code, city_id
    templates: unique_id, client_id
    categories: unique_id, client_id
    menu_items: unique_id, client_id, category_id, image_details
*/

import query from "../../utils/query.utils.js";

export const findTableById = async (tableId, clientId, connection = null) => {
    const sql = `SELECT * FROM tables WHERE unique_id = ? AND client_id = ?`;
    return await query(sql, [tableId, clientId], connection);
};

export const findClientInfo = async (clientId, connection = null) => {
    const sql = `SELECT cli.*, cur.name as currency_name, cur.symbol as currency_symbol, cm.city as cityName FROM clients as cli LEFT JOIN currencies as cur ON cli.currency_code = cur.code LEFT JOIN ucmt_tbl_city_master as cm ON cm.id = cli.city_id WHERE cli.unique_id = ?`;
    return await query(sql, [clientId], connection);
};

export const findTemplateById = async (templateId, clientId, connection = null) => {
    const sql = `SELECT * FROM templates WHERE unique_id = ? AND client_id = ?`;
    return await query(sql, [templateId, clientId], connection);
};

export const findCategoriesByClientId = async (clientId, connection = null) => {
    const sql = `SELECT * FROM categories WHERE client_id = ?`;
    return await query(sql, [clientId], connection);
};

export const findMenuItemsByClientId = async (clientId, connection = null) => {
    const sql = `SELECT menu_items.*, categories.name AS category_name FROM menu_items JOIN categories ON menu_items.category_id = categories.unique_id WHERE menu_items.client_id = ?`;
    return await query(sql, [clientId], connection);
};
