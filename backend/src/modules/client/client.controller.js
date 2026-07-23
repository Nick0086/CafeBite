import * as clientService from "./client.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/errorHelper.js";
import multer from "multer";

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG And PNG files are allowed'));
        }
        cb(null, true);
    }
});

const handleUpload = (req, res) => {
    return new Promise((resolve, reject) => {
        upload.single('cafeLogo')(req, res, (err) => {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return reject(new HttpError("File size exceeds 5MB limit", 400, 'FILE_TOO_LARGE'));
                }
                return reject(new HttpError(err.message, 400, 'FILE_UPLOAD_ERROR'));
            }
            resolve();
        });
    });
};

export const createClient = asyncHandler(async (req, res) => {
    await handleUpload(req, res);

    const result = await clientService.createClient(req.file, req.body);
    return res.status(201).json(result);
});

export const updateClientProfile = asyncHandler(async (req, res) => {
    await handleUpload(req, res);

    const clientId = req.user?.unique_id;
    const result = await clientService.updateClientProfile(clientId, req.file, req.body);
    return res.status(200).json(result);
});

export const fetchClientDataById = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    const user = await clientService.fetchClientDataById(clientId);
    return res.status(200).json({ CODE: 'SUCCESS', status: 'success', data: user });
});
