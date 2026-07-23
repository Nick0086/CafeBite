import sharp from 'sharp';
import * as menuItemRepository from "./menu-item.repository.js";
import { deleteObject, getSignedUrl, uploadObject } from "../../providers/minio/minio.provider.js";
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

const handleImageUpload = async (file, clientId, menuItemId) => {
    if (!file) return null;

    const { originalname, buffer, mimetype } = file;
    const fileName = `${menuItemId}_${Date.now()}_${originalname}`;
    const key = `menuItem/${clientId}/${menuItemId}_${Date.now()}_${originalname}`;

    const originalBuffer = buffer;
    const metadata = await sharp(originalBuffer).metadata();

    let quality = 80;
    let processedBuffer;
    let restarted = false;

    do {
        const imageInstance = sharp(originalBuffer);
        processedBuffer = await imageInstance
            .resize({
                width: metadata.width > 1200 ? 1200 : undefined,
            })
            .jpeg({ quality: Math.max(1, quality), mozjpeg: true })
            .toBuffer();

        if (processedBuffer.length <= 95 * 1024) break;

        if (quality <= 30 && !restarted) {
            restarted = true;
            quality = 25;
            continue;
        }

        quality -= 10;
    } while (quality > 0);

    console.log(`Compressed to ${Math.round(processedBuffer.length / 1024)}KB at quality ${quality}`);

    const finalBuffer = await sharp(processedBuffer)
        .webp({ quality: Math.max(quality, 20) })
        .toBuffer();

    const fileUploadResult = await uploadObject(finalBuffer, key);

    return {
        fileName: originalname,
        public_id: fileName,
        fileMimeType: 'image/webp',
        path: key,
    };
};

export const fetchAllMenuItems = async (clientId) => {
    const menuItems = await menuItemRepository.findAllMenuItems(clientId);
    
    var data = [];
    for (let items of menuItems) {
        var url = '';
        try {
            const uniqueId = items.unique_id;
            if (items?.image_details?.path) {

                if (!signedUrlCache[uniqueId]) {
                    signedUrlCache[uniqueId] = {}
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
            data.push(items)
        } catch (error) {
            data.push(items)
        }
    }

    return {
        success: true,
        message: data?.length > 0 ? "Menu items fetched successfully" : "No menu items found.",
        menuItems: data || [],
        status: "success"
    };
};

export const createMenuItem = async (clientId, categoryId, name, description, price, availability, vegStatus, file) => {
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

    let coverImageDetails = null;
    if (file) {
        coverImageDetails = await handleImageUpload(file, clientId, menuItemId);
        if (!coverImageDetails) {
            throw new HttpError("Failed to upload the image to MinIO", 500);
        }
    }

    const insertResult = await menuItemRepository.createMenuItem(
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
    throw new HttpError(`Failed to add Menu Item "${trimmedName}"`, 500);
};

export const updateMenuItem = async (clientId, menuItemId, categoryId, name, description, price, availability, status, vegStatus, file) => {
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

    let coverImageDetails = existingMenuItem.image_details ? existingMenuItem.image_details : null;
    if (file) {
        if (coverImageDetails?.path) {
            await deleteObject(`${coverImageDetails.path}/${coverImageDetails.public_id}`);
        }
        coverImageDetails = await handleImageUpload(file, clientId, menuItemId);
        if (!coverImageDetails) {
            throw new HttpError("Failed to upload the image to MinIO", 500);
        }
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
