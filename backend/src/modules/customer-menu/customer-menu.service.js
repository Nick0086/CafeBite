import * as customerMenuRepository from "./customer-menu.repository.js";
import { checkSubscriptionStatus } from "../subscription/subscription.service.js";
import { getSignedUrl } from "../../providers/minio/minio.provider.js";
import { HttpError } from "../../utils/errorHelper.js";

let signedUrlCache = {};

export const fetchMenuByTableId = async (userId, tableId) => {
    const isSubscribed = await checkSubscriptionStatus(userId);
    if (!isSubscribed) {
        throw new HttpError("Client subscription expired", 405, 'SUBSCRIPTION_EXPIRED');
    }

    const table = await customerMenuRepository.findTableById(tableId, userId);
    if (!table.length) {
        throw new HttpError("Table not found.", 404, { code: "TABLE_NOT_FOUND" });
    }

    const clientInfo = await customerMenuRepository.findClientInfo(userId);
    if (!clientInfo.length) {
        throw new HttpError("Client not found.", 404, { code: "CLIENT_NOT_FOUND" });
    }

    const user = clientInfo[0];
    if (user.logo_url) {
        const signedUrl = await getSignedUrl(user.logo_url, 86400);
        user.logo_signed_url = signedUrl;
    }

    const menuTemplate = await customerMenuRepository.findTemplateById(table[0].template_id, userId);
    if (!menuTemplate || menuTemplate.length === 0) {
        throw new HttpError("Menu template not found.", 404, { code: "TEMPLATE_NOT_FOUND" });
    }

    return {
        status: "success",
        message: "Menu retrieved successfully.",
        menuTemplate: menuTemplate[0],
        clinetInfo: user
    };
};

export const fetchMenuCategories = async (userId) => {
    const isSubscribed = await checkSubscriptionStatus(userId);
    if (!isSubscribed) {
        throw new HttpError("Client subscription expired", 405, 'SUBSCRIPTION_EXPIRED');
    }

    const categories = await customerMenuRepository.findCategoriesByClientId(userId);

    return {
        success: true,
        message: categories?.total > 0 ? "Categories fetched successfully" : "No categories found.",
        categories: categories || [],
        status: "success"
    };
};

export const fetchMenuItems = async (userId) => {
    const isSubscribed = await checkSubscriptionStatus(userId);
    if (!isSubscribed) {
        throw new HttpError("Client subscription expired", 405, 'SUBSCRIPTION_EXPIRED');
    }

    const menuItems = await customerMenuRepository.findMenuItemsByClientId(userId);

    const data = [];
    for (let items of menuItems) {
        try {
            const uniqueId = items.unique_id;
            if (items?.image_details?.path) {
                if (!signedUrlCache[uniqueId]) {
                    signedUrlCache[uniqueId] = {};
                }

                const cached = signedUrlCache[uniqueId];
                const now = Date.now();

                if (cached && cached.expiresAt > now) {
                    items.image_details.url = cached.url;
                    items.image_details.url_expire_at = cached.expiresAt;
                } else {
                    const signedUrl = await getSignedUrl(items?.image_details?.path, 86400);
                    const expiresAt = now + 86400 * 1000;
                    signedUrlCache[uniqueId] = {
                        url: signedUrl,
                        expiresAt
                    };
                    items.image_details.url = signedUrl;
                    items.image_details.url_expire_at = expiresAt;
                }
            }
            data.push(items);
        } catch (error) {
            data.push(items);
        }
    }

    return {
        success: true,
        message: data?.length > 0 ? "Menu items fetched successfully" : "No menu items found.",
        menuItems: data || [],
        status: "success"
    };
};
