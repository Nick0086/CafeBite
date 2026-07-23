/*
    Database Schema
    ===============
    CREATE TABLE templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id VARCHAR(255) UNIQUE NOT NULL,
        client_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        config JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(unique_id)
    );
*/

import query from "../../utils/query.utils.js";

export const findAllTemplates = async (clientId, connection = null) => {
    const sql = `SELECT id, unique_id, client_id, name, created_at, updated_at FROM templates WHERE client_id = ?`;
    return await query(sql, [clientId], connection);
};

export const findTemplateById = async (clientId, templateId, connection = null) => {
    const sql = `SELECT * FROM templates WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [clientId, templateId], connection);
};

export const checkTemplateByName = async (clientId, name, excludeTemplateId = null, connection = null) => {
    const sql = excludeTemplateId
        ? `SELECT COUNT(*) AS total FROM templates WHERE client_id = ? AND name = ? AND unique_id != ?`
        : `SELECT COUNT(*) AS total FROM templates WHERE client_id = ? AND name = ?`;
    const params = excludeTemplateId ? [clientId, name, excludeTemplateId] : [clientId, name];
    return await query(sql, params, connection);
};

export const createTemplate = async (templateId, clientId, name, config, connection = null) => {
    const sql = `INSERT INTO templates (unique_id, client_id, name, config) VALUES (?, ?, ?, ?)`;
    return await query(sql, [templateId, clientId, name, JSON.stringify(config || {})], connection);
};

export const updateTemplate = async (clientId, templateId, name, config, connection = null) => {
    const sql = `UPDATE templates SET name = ?, config = ? WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [name, JSON.stringify(config || {}), clientId, templateId], connection);
};

export const checkClientExists = async (clientId, connection = null) => {
    const sql = `SELECT 1 FROM clients WHERE unique_id = ?`;
    return await query(sql, [clientId], connection);
};
