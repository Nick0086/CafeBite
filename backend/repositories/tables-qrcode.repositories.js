import query from "../utils/query.utils.js";

const getAllTables = async (userId) => {
    const sql = `SELECT * FROM tables WHERE client_id = ?`;
    return await query(sql, [userId]);
};

const getTableById = async (userId, tableId) => {
    const sql = `SELECT * FROM tables WHERE unique_id = ? AND client_id = ?`;
    return await query(sql, [tableId, userId]);
};

const checkTableByNumber = async (userId, tableNumber, excludeTableId = null) => {
    const sql = excludeTableId
        ? `SELECT COUNT(*) AS total FROM tables WHERE client_id = ? AND table_number = ? AND unique_id != ?`
        : `SELECT COUNT(*) AS total FROM tables WHERE client_id = ? AND table_number = ?`;
    const params = excludeTableId
        ? [userId, tableNumber, excludeTableId]
        : [userId, tableNumber];
    return await query(sql, params);
};

const createTable = async (tableId, userId, templateId, tableNumber, status) => {
    const sql = `INSERT INTO tables (unique_id, client_id, template_id, table_number, status) VALUES (?, ?, ?, ?, ?)`;
    return await query(sql, [tableId, userId, templateId, tableNumber, status]);
};

const updateTable = async (userId, tableId, tableNumber, templateId) => {
    const sql = `UPDATE tables SET table_number = ?, template_id = ? WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [tableNumber, templateId, userId, tableId]);
};

export default {
    getAllTables,
    getTableById,
    checkTableByNumber,
    createTable,
    updateTable
};