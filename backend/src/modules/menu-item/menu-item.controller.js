import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/errorHelper.js";
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
                return reject(new HttpError(err.message || "Error while uploading the image", 400, 'IMAGE_UPLOAD_ERROR'));
            }
            resolve();
        });
    });
};

export const fetchAllMenuItems = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const response = await menuItemService.fetchAllMenuItems(clientId);
    return res.status(200).json(response);
});

export const createMenuItem = asyncHandler(async (req, res) => {
    await handleImageUpload(req);
    const { unique_id: clientId } = req.user;
    const { category_id, name, description, price, availability, veg_status } = req.body;
    const response = await menuItemService.createMenuItem(clientId, category_id, name, description, price, availability, veg_status, req.file);
    return res.status(201).json(response);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
    await handleImageUpload(req);
    const { unique_id: clientId } = req.user;
    const { category_id, name, description, price, availability, status, veg_status } = req.body;
    const { menuItemId } = req.params;
    const response = await menuItemService.updateMenuItem(clientId, menuItemId, category_id, name, description, price, availability, status, veg_status, req.file);
    return res.status(200).json(response);
});
