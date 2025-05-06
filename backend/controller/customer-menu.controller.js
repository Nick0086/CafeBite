import query from "../utils/query.utils.js";
import { handleError } from "../utils/utils.js";

export const getMenuForCustomerByTableId = async (req, res) => {
    try {
        const { tableId, userId } = req.params;

        const table = await query('SELECT * FROM tables WHERE unique_id = ? AND client_id = ?', [tableId, userId]);

        if (!table.length) {
            return res.status(404).json({ status: "error", code: "TABLE_NOT_FOUND", message: "Table not found." });
        }

        const menuTemplate = await query(`SELECT * FROM templates WHERE unique_id = ? AND client_id = ?`,
            [table[0].template_id, userId]);

        if (!menuTemplate || menuTemplate.length === 0) {
            return res.status(404).json({
                status: "error",
                code: "TEMPLATE_NOT_FOUND",
                message: "Menu template not found."
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Menu retrieved successfully.",
            menuTemplate: menuTemplate[0]
        });
    } catch (error) {
        handleError('customer-menu.controller.js', 'getMenuForCustomerByTableId', res, error, 'An unexpected error occurred while retrieving the menu.');
    }
};

export const getMenuCategoryForConsumer = async (req, res) => {
    try {
        const { userId } = req.params;

        const categoryExists = await query('SELECT * FROM categories WHERE client_id = ? ', [userId]);

        return res.status(200).json({
            success: true,
            message: categoryExists?.total > 0 ? "Categories fetched successfully" : "No categories found.",
            categories: categoryExists || [],
            status: "success"
        });

    } catch (error) {
        handleError('customer-menu.controller.js', 'getMenuCategoryForConsumer', res, error, 'An unexpected error occurred while retrieving the menu Category.');
    }
}

export const getMenuItemsForConsumer = async (req, res) => {
    try {
        const { userId } = req.params;

        let sql = `
            SELECT menu_items.*, categories.name AS category_name
            FROM menu_items
            JOIN categories ON menu_items.category_id = categories.unique_id
            WHERE menu_items.client_id = ?
        `;

        const categoryExists = await query(sql, [userId]);

        return res.status(200).json({
            success: true,
            message: categoryExists?.length > 0 ? "Menu items fetched successfully" : "No menu items found.",
            menuItems: categoryExists || [],
            status: "success"
        });

    } catch (error) {
        handleError('customer-menu.controller.js', 'getMenuItemsForConsumer', res, error, 'An unexpected error occurred while retrieving the menu Category.');
    }
}
