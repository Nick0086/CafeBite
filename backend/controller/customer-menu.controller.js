import { getSignedUrlFromS3 } from "../services/r2/r2.service.js";
import query from "../utils/query.utils.js";
import { handleError } from "../utils/utils.js";
import { checkSubscriptionStatus } from "./subscription.controller.js";

let signedUrlCache = {};

export const getMenuForCustomerByTableId = async (req, res) => {
    try {
        const { tableId, userId } = req.params;

        const isSubscribed = await checkSubscriptionStatus(userId);
        if (!isSubscribed) {
            return res.status(405).json({ code: 'SUBSCRIPTION_ExPIRED', message: 'Clinet Subscription Expired' });
        }

        const table = await query('SELECT * FROM tables WHERE unique_id = ? AND client_id = ?', [tableId, userId]);

        if (!table.length) {
            return res.status(404).json({ status: "error", code: "TABLE_NOT_FOUND", message: "Table not found." });
        }

        var cilentINfo = await query(`SELECT cli.*, cur.name as currency_name, cur.symbol as currency_symbol, cm.city as cityName FROM clients as cli LEFT JOIN currencies as cur ON cli.currency_code = cur.code LEFT JOIN ucmt_tbl_city_master as cm ON cm.id = cli.city_id WHERE cli.unique_id = ?`, [userId]);

        if (!cilentINfo.length) {
            return res.status(404).json({ status: "error", code: "CLIENT_NOT_FOUND", message: "Client not found." });
        }
        var user = cilentINfo[0];
        if (user.logo_url) {
            const signedUrl = await getSignedUrlFromS3(user.logo_url, 86400);
            user.logo_signed_url = signedUrl;
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
            menuTemplate: menuTemplate[0],
            clinetInfo: user
        });
    } catch (error) {
        handleError('customer-menu.controller.js', 'getMenuForCustomerByTableId', res, error, 'An unexpected error occurred while retrieving the menu.');
    }
};

export const getMenuCategoryForConsumer = async (req, res) => {
    try {
        const { userId } = req.params;

        const isSubscribed = await checkSubscriptionStatus(userId);
        if (!isSubscribed) {
            return res.status(405).json({ code: 'SUBSCRIPTION_ExPIRED', message: 'Clinet Subscription Expired' });
        }

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
        const isSubscribed = await checkSubscriptionStatus(userId);
        if (!isSubscribed) {
            return res.status(405).json({ code: 'SUBSCRIPTION_ExPIRED', message: 'Clinet Subscription Expired' });
        }
        let sql = `
            SELECT menu_items.*, categories.name AS category_name
            FROM menu_items
            JOIN categories ON menu_items.category_id = categories.unique_id
            WHERE menu_items.client_id = ?
        `;

        const categoryExists = await query(sql, [userId]);

        var data = [];

        for (let items of categoryExists) {
            try {
                const uniqueId = items.unique_id;
                if (items?.image_details?.path) {

                    if (!signedUrlCache[uniqueId]) {
                        signedUrlCache[uniqueId] = {}
                    }

                    const cached = signedUrlCache[uniqueId];
                    const now = Date.now();

                    if (cached && cached.expiresAt > now) {
                        // Use cached signed URL
                        items.image_details.url = cached.url;
                        items.image_details.url_expire_at = cached.expiresAt;
                    } else {
                        const signedUrl = await getSignedUrlFromS3(items?.image_details?.path, 86400);
                        const expiresAt = now + 86400 * 1000;
                        signedUrlCache[uniqueId] = {
                            url: signedUrl,
                            expiresAt
                        };
                        items.image_details.url = signedUrl;
                        items.image_details.url_expire_at = expiresAt;
                    }
                }
                data.push(items)
            } catch (error) {
                data.push(items)
            }
        }

        return res.status(200).json({
            success: true,
            message: data?.length > 0 ? "Menu items fetched successfully" : "No menu items found.",
            menuItems: data || [],
            status: "success"
        });

    } catch (error) {
        handleError('customer-menu.controller.js', 'getMenuItemsForConsumer', res, error, 'An unexpected error occurred while retrieving the menu Category.');
    }
}