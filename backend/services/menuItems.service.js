import sharp from 'sharp';
import menuItemsRepository from '../repositories/menuItems.repository.js';
import { deleteResourceFromCloudinary, uploadStreamToCloudinary } from "../services/cloudinary/cloudinary.service.js";

let counter = 0;

export const createUniqueId = (prefix) => {
    counter++;
    if (counter > 999) counter = 1;

    return prefix + '_' + Date.now() + Math.floor(Math.random() * 1000) + counter;
}

const validateMenuItemInput = (name, price, availability) => {
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        return { status: 400, code: "INVALID_NAME", message: "Menu Item name must be a non-empty string and less than 255 characters" };
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice < 0) {
        return { status: 400, code: "INVALID_PRICE", message: "Menu Item Price is required and must be a valid positive number" };
    }

    if (availability && !['in_stock', 'out_of_stock'].includes(availability)) {
        return { status: 400, code: "INVALID_AVAILABILITY", message: "Availability must be 'in_stock' or 'out_of_stock'" };
    }
    return null;
};

const handleImageUpload = async (file, clientId, menuItemId) => {
    if (!file) return null;

    const { originalname, buffer, mimetype } = file;
    const fileName = `${menuItemId}_${Date.now()}_${originalname}`;
    const key = `menuItem/${clientId}`;
    let processedBuffer = buffer;

    if (buffer.length > 500 * 1024) {
        try {
            processedBuffer = await sharp(buffer)
                .jpeg({ quality: 20, mozjpeg: true })
                .toBuffer();
            if (processedBuffer.length > 250 * 1024) {
                processedBuffer = await sharp(processedBuffer)
                    .jpeg({ quality: 10, mozjpeg: true })
                    .toBuffer();
            }
        } catch (err) {
            console.error("Error compressing image:", err);
            processedBuffer = buffer;
        }
    }

    const options = {
        folder: key,
        public_id: fileName,
        resource_type: 'auto',
        overwrite: false,
        format: 'webp'
    };

    const fileUploadResult = await uploadStreamToCloudinary(processedBuffer, options);
    if (!fileUploadResult?.secure_url) {
        throw new Error('Upload succeeded but no secure URL returned');
    }

    return {
        fileName: originalname,
        public_id: fileName,
        fileMimeType: 'image/webp',
        path: key,
        url: fileUploadResult.secure_url
    };
};

const fetchAllMenuItems = async (clientId) => {
    const menuItems = await menuItemsRepository.getAllMenuItems(clientId);
    return {
        success: true,
        message: menuItems?.length > 0 ? "Menu items fetched successfully" : "No menu items found.",
        menuItems: menuItems || [],
        status: "success"
    };
};

const addNewMenuItem = async (clientId, categoryId, name, description, price, availability, vegStatus, file) => {
    const validationError = validateMenuItemInput(name, price, availability);
    if (validationError) {
        throw validationError;
    }

    const trimmedName = name.trim();
    const [category] = await menuItemsRepository.verifyCategoryExists(categoryId, clientId);
    if (!category) {
        throw { status: 400, code: "INVALID_CATEGORY", message: "Category not found or does not belong to client" };
    }

    const [duplicate] = await menuItemsRepository.checkDuplicateMenuItem(clientId, categoryId, trimmedName);
    if (duplicate?.total > 0) {
        throw { status: 400, code: "MENU_ITEM_EXISTS", message: `Menu Item ${trimmedName} already exists in this category` };
    }

    const position = (await menuItemsRepository.getMenuItemCount(clientId, categoryId))[0]?.total + 1 || 1;
    const menuItemId = createUniqueId('MI');

    let coverImageDetails = null;
    if (file) {
        coverImageDetails = await handleImageUpload(file, clientId, menuItemId);
        if (!coverImageDetails) {
            throw { status: 500, code: "IMAGE_UPLOAD_FAILED", message: "Failed to upload the image to Cloudinary" };
        }
    }

    const insertResult = await menuItemsRepository.createMenuItem(
        menuItemId,
        clientId,
        categoryId,
        trimmedName,
        description,
        parseFloat(price),
        coverImageDetails,
        availability || 'in_stock',
        1,
        position,
        vegStatus || 'veg'
    );

    if (insertResult?.affectedRows > 0) {
        return { status: "success", message: `Menu Item ${trimmedName} added successfully`, data: { unique_id: menuItemId } };
    }
    throw { status: 500, code: "MENU_ITEM_ADD_FAILED", message: `Failed to add Menu Item "${trimmedName}"` };
};

const modifyMenuItem = async (clientId, menuItemId, categoryId, name, description, price, availability, status, vegStatus, file) => {
    const validationError = validateMenuItemInput(name, price, availability);
    if (validationError) {
        throw validationError;
    }

    const trimmedName = name.trim();
    const [existingMenuItem] = await menuItemsRepository.getMenuItemById(menuItemId, clientId);
    if (!existingMenuItem) {
        throw { status: 404, code: "MENU_ITEM_NOT_FOUND", message: "Menu Item not found or you do not have permission to update it" };
    }

    const [category] = await menuItemsRepository.verifyCategoryExists(categoryId, clientId);
    if (!category) {
        throw { status: 400, code: "INVALID_CATEGORY", message: "Category not found or does not belong to client" };
    }

    const [duplicate] = await menuItemsRepository.checkDuplicateMenuItem(clientId, categoryId, trimmedName, menuItemId);
    if (duplicate?.total > 0) {
        throw { status: 400, code: "MENU_ITEM_EXISTS", message: `Menu Item ${trimmedName} already exists in this category` };
    }

    let coverImageDetails = existingMenuItem.image_details ? existingMenuItem.image_details : null;
    if (file) {
        if (coverImageDetails?.path) {
            await deleteResourceFromCloudinary(`${coverImageDetails.path}/${coverImageDetails.public_id}`);
        }
        coverImageDetails = await handleImageUpload(file, clientId, menuItemId);
        if (!coverImageDetails) {
            throw { status: 500, code: "IMAGE_UPLOAD_FAILED", message: "Failed to upload the image to Cloudinary" };
        }
    }

    const updateResult = await menuItemsRepository.updateMenuItem(
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
    throw { status: 500, code: "MENU_ITEM_UPDATE_FAILED", message: `Failed to update Menu Item ${trimmedName}` };
};

export default {
    fetchAllMenuItems,
    addNewMenuItem,
    modifyMenuItem
};