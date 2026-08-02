import * as menuItemRepository from "./menu-item.repository.js";
import { deleteObject, getSignedUrl, getUploadSignedUrl } from "../../providers/minio/minio.provider.js";
import { HttpError } from "../../utils/errorHelper.js";

var signedUrlCache = {};
let counter = 0;

export const createUniqueId = (prefix) => {
    counter++;
    if (counter > 999) counter = 1;

    return prefix + '_' + Date.now() + Math.floor(Math.random() * 1000) + counter;
}

const validateMenuItemInput = (name, price, availability) => {
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw new HttpError("Menu Item name must be a non-empty string and less than 255 characters", 400);
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice < 0) {
        throw new HttpError("Menu Item Price is required and must be a valid positive number", 400);
    }

    if (availability && !['in_stock', 'out_of_stock'].includes(availability)) {
        throw new HttpError("Availability must be 'in_stock' or 'out_of_stock'", 400);
    }
};

export const generateUploadUrl = async (clientId) => {
    const timestamp = Date.now();
    const key = `menuItem/${clientId}/upload_${timestamp}.webp`;
    const uploadUrl = await getUploadSignedUrl(key, 300);
    return { uploadUrl, key };
};

const parseImageDetails = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return null; }
};

export const fetchAllMenuItems = async (clientId) => {
    const menuItems = await menuItemRepository.findAllMenuItems(clientId);

    menuItems.forEach((item) => {
        if (item.image_details) {
            item.image_details = parseImageDetails(item.image_details);
        }
    });

    return {
        success: true,
        message: menuItems?.length > 0 ? "Menu items fetched successfully" : "No menu items found.",
        menuItems: menuItems || [],
        status: "success"
    };
};

export const getMenuItemImageUrl = async (clientId, menuItemId) => {
    const [menuItem] = await menuItemRepository.findMenuItemById(menuItemId, clientId);
    if (!menuItem) {
        throw new HttpError("Menu Item not found", 404);
    }

    const imageDetails = parseImageDetails(menuItem.image_details);

    if (!imageDetails?.path) {
        return { success: true, imageUrl: null };
    }

    const now = Date.now();
    if (!signedUrlCache[menuItemId]) signedUrlCache[menuItemId] = {};

    const cached = signedUrlCache[menuItemId];
    if (cached?.url && cached?.expiresAt > now) {
        return { success: true, imageUrl: cached.url, expiresAt: cached.expiresAt };
    }

    const signedUrl = await getSignedUrl(imageDetails.path, 86400);
    const expiresAt = now + 86400 * 1000;
    signedUrlCache[menuItemId] = { url: signedUrl, expiresAt };

    return { success: true, imageUrl: signedUrl, expiresAt };
};

export const createMenuItem = async (clientId, categoryId, name, description, price, availability, vegStatus, imageDetails) => {
    validateMenuItemInput(name, price, availability);

    const trimmedName = name.trim();
    const [category] = await menuItemRepository.checkCategoryExists(categoryId, clientId);
    if (!category) {
        throw new HttpError("Category not found or does not belong to client", 400);
    }

    const [duplicate] = await menuItemRepository.checkDuplicateMenuItem(clientId, categoryId, trimmedName);
    if (duplicate?.total > 0) {
        throw new HttpError(`Menu Item ${trimmedName} already exists in this category`, 400);
    }

    const position = (await menuItemRepository.countMenuItems(clientId, categoryId))[0]?.total + 1 || 1;
    const menuItemId = createUniqueId('MI');

    const insertResult = await menuItemRepository.createMenuItem(
        menuItemId,
        clientId,
        categoryId,
        trimmedName,
        description,
        parseFloat(price),
        imageDetails || null,
        availability || 'in_stock',
        1,
        position,
        vegStatus || 'veg'
    );

    if (insertResult?.affectedRows > 0) {
        return { status: "success", message: `Menu Item ${trimmedName} added successfully`, data: { unique_id: menuItemId } };
    }
    throw new HttpError(`Failed to add Menu Item "${trimmedName}"`, 500);
};

export const updateMenuItem = async (clientId, menuItemId, categoryId, name, description, price, availability, status, vegStatus, imageDetails) => {
    validateMenuItemInput(name, price, availability);

    const trimmedName = name.trim();
    const [existingMenuItem] = await menuItemRepository.findMenuItemById(menuItemId, clientId);
    if (!existingMenuItem) {
        throw new HttpError("Menu Item not found or you do not have permission to update it", 404);
    }

    const [category] = await menuItemRepository.checkCategoryExists(categoryId, clientId);
    if (!category) {
        throw new HttpError("Category not found or does not belong to client", 400);
    }

    const [duplicate] = await menuItemRepository.checkDuplicateMenuItem(clientId, categoryId, trimmedName, menuItemId);
    if (duplicate?.total > 0) {
        throw new HttpError(`Menu Item ${trimmedName} already exists in this category`, 400);
    }

    const oldImageDetails = parseImageDetails(existingMenuItem.image_details);
    let coverImageDetails = oldImageDetails;

    if (imageDetails && imageDetails.path) {
        if (oldImageDetails?.path && oldImageDetails.path !== imageDetails.path) {
            await deleteObject(oldImageDetails.path);
        }
        coverImageDetails = imageDetails;
    }

    const updateResult = await menuItemRepository.updateMenuItem(
        menuItemId,
        clientId,
        categoryId,
        trimmedName,
        description,
        parseFloat(price),
        coverImageDetails,
        availability || existingMenuItem.availability,
        status !== undefined ? status : existingMenuItem.status,
        vegStatus || existingMenuItem.veg_status
    );

    if (updateResult?.affectedRows > 0) {
        return { status: "success", message: `Menu Item ${trimmedName} updated successfully` };
    }
    throw new HttpError(`Failed to update Menu Item ${trimmedName}`, 500);
};
