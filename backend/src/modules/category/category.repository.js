/*
    Database Schema
    ===============
    CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id CHAR(36) NOT NULL UNIQUE,
        client_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status INT DEFAULT 1,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
    );
*/

import query from "../../utils/query.utils.js";

export const findAllCategories = async (userId, connection = null) => {
    const sql = `
        SELECT 
            categories.*, 
            COUNT(menu_items.id) AS menu_item_count
        FROM 
            categories as categories
        LEFT JOIN 
            menu_items ON categories.unique_id = menu_items.category_id
        WHERE 
            categories.client_id = ?
        GROUP BY 
            categories.id
    `;
    return await query(sql, [userId], connection);
};

export const findCategoryByName = async (userId, name, categoryId, connection = null) => {
    let sql = 'SELECT COUNT(*) AS total FROM categories WHERE client_id = ? AND name = ?';
    let values = [userId, name.trim()];
    if (categoryId) {
        sql += ' AND unique_id != ?';
        values.push(categoryId);
    }
    return await query(sql, values, connection);
};

export const findCategoryById = async (userId, categoryId, connection = null) => {
    const sql = 'SELECT 1 FROM categories WHERE client_id = ? AND unique_id = ?';
    return await query(sql, [userId, categoryId], connection);
};

export const countCategories = async (userId, connection = null) => {
    const sql = 'SELECT COUNT(*) AS total FROM categories WHERE client_id = ?';
    return await query(sql, [userId], connection);
};

export const createCategory = async (categoryId, userId, name, status, position, connection = null) => {
    const sql = `INSERT INTO categories (unique_id, client_id, name, status, position) VALUES (?, ?, ?, ?, ?)`;
    return await query(sql, [categoryId, userId, name.trim(), status, position], connection);
};

export const updateCategory = async (userId, categoryId, name, status, connection = null) => {
    const sql = `UPDATE categories SET name = ?, status = ? WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [name.trim(), status, userId, categoryId], connection);
};
