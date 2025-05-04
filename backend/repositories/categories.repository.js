import query from "../utils/query.utils.js";
/*CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    client_id CHAR(36) NOT NULL,  -- Should match the type of users.unique_id
    name VARCHAR(255) NOT NULL,
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);*/

const getAllCategories = async (userId) => {
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
    return await query(sql, [userId]);
};

const getCategoryByName = async (userId, name, categoryId) => {
    var sql = 'SELECT COUNT(*) AS total FROM categories WHERE client_id = ? AND name = ?';
    if (categoryId) sql += ' AND unique_id != ?';
    var value = [userId, name.trim()];
    if (categoryId) value.push(categoryId);
    return await query(sql, value);
};

const getCategoryById = async (userId, categoryId) => {
    const sql = 'SELECT 1 FROM categories WHERE client_id = ? AND unique_id = ?';
    return await query(sql, [userId, categoryId]);
};

const getCategoryCount = async (userId) => {
    const sql = 'SELECT COUNT(*) AS total FROM categories WHERE client_id = ?';
    return await query(sql, [userId]);
};

const createCategory = async (categoryId, userId, name, status, position) => {
    const sql = `INSERT INTO categories (unique_id, client_id, name, status, position) VALUES (?, ?, ?, ?, ?)`;
    return await query(sql, [categoryId, userId, name.trim(), status, position]);
};

const updateCategory = async (userId, categoryId, name, status) => {
    const sql = `UPDATE categories SET name = ?, status = ? WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [name.trim(), status, userId, categoryId]);
};

export default  {
    getAllCategories,
    getCategoryByName,
    getCategoryById,
    getCategoryCount,
    createCategory,
    updateCategory
};