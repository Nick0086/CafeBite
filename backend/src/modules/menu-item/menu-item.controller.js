import { handleError } from "../../utils/errorHelper.js";
import multer from "multer";
import * as menuItemService from "./menu-item.service.js";

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG And PNG files are allowed'));
        }
        cb(null, true);
    }
});

const handleImageUpload = (req) => {
    return new Promise((resolve, reject) => {
        upload.single('cover_image')(req, req.res, (err) => {
            if (err) {
                return reject(new Error(err.message || "Error while uploading the image"));
            }
            resolve();
        });
    });
};

export const fetchAllMenuItems = async (req, res) => {
    try {
        const { unique_id: clientId } = req.user;
        const response = await menuItemService.fetchAllMenuItems(clientId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('menu-item.controller.js', 'fetchAllMenuItems', res, error, 'An unexpected error occurred while fetching menu items.');
    }
};

export const createMenuItem = async (req, res) => {
    try {
        await handleImageUpload(req);
        const { unique_id: clientId } = req.user;
        const { category_id, name, description, price, availability, veg_status } = req.body;
        const response = await menuItemService.createMenuItem(clientId, category_id, name, description, price, availability, veg_status, req.file);
        return res.status(201).json(response);
    } catch (error) {
        if (error.message?.includes('upload') || error.message?.includes('image')) {
            return res.status(400).json({
                status: "error",
                code: "IMAGE_UPLOAD_ERROR",
                message: error.message
            });
        }
        handleError('menu-item.controller.js', 'createMenuItem', res, error, 'An unexpected error occurred while adding the Menu Item');
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        await handleImageUpload(req);
        const { unique_id: clientId } = req.user;
        const { category_id, name, description, price, availability, status, veg_status } = req.body;
        const { menuItemId } = req.params;
        const response = await menuItemService.updateMenuItem(clientId, menuItemId, category_id, name, description, price, availability, status, veg_status, req.file);
        return res.status(200).json(response);
    } catch (error) {
        if (error.message?.includes('upload') || error.message?.includes('image')) {
            return res.status(400).json({
                status: "error",
                code: "IMAGE_UPLOAD_ERROR",
                message: error.message
            });
        }
        handleError('menu-item.controller.js', 'updateMenuItem', res, error, 'An unexpected error occurred while updating the Menu Item');
    }
};
