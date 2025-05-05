import query from "../utils/query.utils.js";

const getAllTemplates = async (clientId) => {
    const sql = `SELECT id, unique_id, client_id, name, created_at, updated_at FROM templates WHERE client_id = ?`;
    return await query(sql, [clientId]);
};

const getTemplateById = async (clientId, templateId) => {
    const sql = `SELECT * FROM templates WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [clientId, templateId]);
};

const checkTemplateByName = async (clientId, name, excludeTemplateId = null) => {
    const sql = excludeTemplateId
        ? `SELECT COUNT(*) AS total FROM templates WHERE client_id = ? AND name = ? AND unique_id != ?`
        : `SELECT COUNT(*) AS total FROM templates WHERE client_id = ? AND name = ?`;
    const params = excludeTemplateId ? [clientId, name, excludeTemplateId] : [clientId, name];
    return await query(sql, params);
};

const createTemplate = async (templateId, clientId, name, config) => {
    const sql = `INSERT INTO templates (unique_id, client_id, name, config) VALUES (?, ?, ?, ?)`;
    return await query(sql, [templateId, clientId, name, JSON.stringify(config || {})]);
};

const updateTemplate = async (clientId, templateId, name, config) => {
    const sql = `UPDATE templates SET name = ?, config = ? WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [name, JSON.stringify(config || {}), clientId, templateId]);
};

const checkClientExists = async (clientId) => {
    const sql = `SELECT 1 FROM clients WHERE unique_id = ?`;
    return await query(sql, [clientId]);
};

export default {
    getAllTemplates,
    getTemplateById,
    checkTemplateByName,
    createTemplate,
    updateTemplate,
    checkClientExists
};