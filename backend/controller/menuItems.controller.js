import { handleError } from "../utils/utils.js";
import multer from "multer";
import menuItemsService from "../services/menuItems.service.js";

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG And PNG files are allowed'));
        }
        cb(null, true);
    }
});

const getAllMenuItems = async (req, res) => {
    try {
        const { unique_id: clientId } = req.user;
        const response = await menuItemsService.fetchAllMenuItems(clientId);

        return res.status(200).json(response);
    } catch (error) {
        handleError('menuItems.controller.js', 'getAllMenuItems', res, error, 'An unexpected error occurred while fetching menu items.');
    }
};

const addMenuItem = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload.single('cover_image')(req, res, (err) => {
                if (err) {
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading the image"
                    });
                }
                resolve();
            });
        });

        const { unique_id: clientId } = req.user;
        const { category_id, name, description, price, availability, veg_status } = req.body;
        const response = await menuItemsService.addNewMenuItem(clientId, category_id, name, description, price, availability, veg_status, req.file);
        return res.status(201).json(response);
    } catch (error) {
        handleError('menuItems.controller.js', 'addMenuItem', res, error, 'An unexpected error occurred while adding the Menu Item');
    }
};

const updateMenuItem = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload.single('cover_image')(req, res, (err) => {
                if (err) {
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading the image"
                    });
                }
                resolve();
            });
        });

        const { unique_id: clientId } = req.user;
        const { category_id, name, description, price, availability, status, veg_status } = req.body;
        const { menuItemId } = req.params;
        const response = await menuItemsService.modifyMenuItem(clientId, menuItemId, category_id, name, description, price, availability, status, veg_status, req.file);
        return res.status(200).json(response);
    } catch (error) {
        handleError('menuItems.controller.js', 'updateMenuItem', res, error, 'An unexpected error occurred while updating the Menu Item');
    }
};

export default {
    getAllMenuItems,
    addMenuItem,
    updateMenuItem
};