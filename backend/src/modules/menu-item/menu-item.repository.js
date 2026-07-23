/*
    Database Schema
    ===============
    CREATE TABLE menu_items (
        sr_no INT AUTO_INCREMENT PRIMARY KEY,
        unique_id VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255),
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
        updated_by VARCHAR(255),
        client_id VARCHAR(255) NOT NULL,
        category_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_details JSON,
        availability ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
        status TINYINT DEFAULT 1,
        position INT,
        veg_status ENUM('veg', 'non_veg', 'egg') DEFAULT 'veg',
        FOREIGN KEY (category_id) REFERENCES categories(unique_id)
    );
*/

import query from "../../utils/query.utils.js";

export const findAllMenuItems = async (clientId, connection = null) => {
    const sql = `
        SELECT menu_items.*, categories.name AS category_name
        FROM menu_items
        JOIN categories ON menu_items.category_id = categories.unique_id
        WHERE menu_items.client_id = ?
    `;
    return await query(sql, [clientId], connection);
};

export const checkDuplicateMenuItem = async (clientId, categoryId, name, excludeMenuItemId = null, connection = null) => {
    const sql = excludeMenuItemId
        ? 'SELECT COUNT(*) AS total FROM menu_items WHERE client_id = ? AND name = ? AND category_id = ? AND unique_id != ?'
        : 'SELECT COUNT(*) AS total FROM menu_items WHERE client_id = ? AND name = ? AND category_id = ?';
    const params = excludeMenuItemId
        ? [clientId, name, categoryId, excludeMenuItemId]
        : [clientId, name, categoryId];
    return await query(sql, params, connection);
};

export const checkCategoryExists = async (categoryId, clientId, connection = null) => {
    const sql = 'SELECT 1 FROM categories WHERE unique_id = ? AND client_id = ?';
    return await query(sql, [categoryId, clientId], connection);
};

export const findMenuItemById = async (menuItemId, clientId, connection = null) => {
    const sql = 'SELECT * FROM menu_items WHERE unique_id = ? AND client_id = ?';
    return await query(sql, [menuItemId, clientId], connection);
};

export const countMenuItems = async (clientId, categoryId, connection = null) => {
    const sql = 'SELECT COUNT(*) AS total FROM menu_items WHERE client_id = ? AND category_id = ?';
    return await query(sql, [clientId, categoryId], connection);
};

export const createMenuItem = async (menuItemId, clientId, categoryId, name, description, price, imageDetails, availability, status, position, vegStatus, connection = null) => {
    const sql = `
        INSERT INTO menu_items (unique_id, client_id, category_id, name, description, price, image_details, availability, status, position, veg_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await query(sql, [
        menuItemId,
        clientId,
        categoryId,
        name,
        description || null,
        price,
        imageDetails ? JSON.stringify(imageDetails) : null,
        availability,
        status,
        position,
        vegStatus
    ], connection);
};

export const updateMenuItem = async (menuItemId, clientId, categoryId, name, description, price, imageDetails, availability, status, vegStatus, connection = null) => {
    const sql = `
        UPDATE menu_items
        SET category_id = ?, name = ?, description = ?, price = ?, image_details = ?, availability = ?, status = ?, veg_status = ?
        WHERE unique_id = ? AND client_id = ?
    `;
    return await query(sql, [
        categoryId,
        name,
        description || null,
        price,
        imageDetails ? JSON.stringify(imageDetails) : null,
        availability,
        status,
        vegStatus,
        menuItemId,
        clientId
    ], connection);
};
