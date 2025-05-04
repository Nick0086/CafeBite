import query from "../utils/query.utils.js";

const getAllMenuItems = async (clientId) => {
    const sql = `
        SELECT menu_items.*, categories.name AS category_name
        FROM menu_items
        JOIN categories ON menu_items.category_id = categories.unique_id
        WHERE menu_items.client_id = ?
    `;
    return await query(sql, [clientId]);
};

const checkDuplicateMenuItem = async (clientId, categoryId, name, excludeMenuItemId = null) => {
    const sql = excludeMenuItemId
        ? 'SELECT COUNT(*) AS total FROM menu_items WHERE client_id = ? AND name = ? AND category_id = ? AND unique_id != ?'
        : 'SELECT COUNT(*) AS total FROM menu_items WHERE client_id = ? AND name = ? AND category_id = ?';
    const params = excludeMenuItemId
        ? [clientId, name, categoryId, excludeMenuItemId]
        : [clientId, name, categoryId];
    return await query(sql, params);
};

const verifyCategoryExists = async (categoryId, clientId) => {
    const sql = 'SELECT 1 FROM categories WHERE unique_id = ? AND client_id = ?';
    return await query(sql, [categoryId, clientId]);
};

const getMenuItemById = async (menuItemId, clientId) => {
    const sql = 'SELECT * FROM menu_items WHERE unique_id = ? AND client_id = ?';
    return await query(sql, [menuItemId, clientId]);
};

const getMenuItemCount = async (clientId, categoryId) => {
    const sql = 'SELECT COUNT(*) AS total FROM menu_items WHERE client_id = ? AND category_id = ?';
    return await query(sql, [clientId, categoryId]);
};

const createMenuItem = async (menuItemId, clientId, categoryId, name, description, price, imageDetails, availability, status, position, vegStatus) => {
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
    ]);
};

const updateMenuItem = async (menuItemId, clientId, categoryId, name, description, price, imageDetails, availability, status, vegStatus) => {
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
    ]);
};

export default {
    getAllMenuItems,
    checkDuplicateMenuItem,
    verifyCategoryExists,
    getMenuItemById,
    getMenuItemCount,
    createMenuItem,
    updateMenuItem
};