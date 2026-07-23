import * as clientService from "./client.service.js";
import { handleError } from "../../utils/errorHelper.js";
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
                return reject(err);
            }
            resolve();
        });
    });
};

export const createClient = async (req, res) => {
    try {
        await handleUpload(req, res);

        const result = await clientService.createClient(req.file, req.body);
        return res.status(201).json(result);
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: "error",
                code: "FILE_TOO_LARGE",
                message: "File size exceeds 5MB limit"
            });
        }
        return handleError('client.controller.js', 'createClient', res, error);
    }
};

export const updateClientProfile = async (req, res) => {
    try {
        await handleUpload(req, res);

        const clientId = req.user?.unique_id;
        const result = await clientService.updateClientProfile(clientId, req.file, req.body);
        return res.status(200).json(result);
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: "error",
                code: "FILE_TOO_LARGE",
                message: "File size exceeds 5MB limit"
            });
        }
        return handleError('client.controller.js', 'updateClientProfile', res, error);
    }
};

export const fetchClientDataById = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        const user = await clientService.fetchClientDataById(clientId);
        return res.status(200).json({ CODE: 'SUCCESS', status: 'success', data: user });
    } catch (error) {
        return handleError('client.controller.js', 'fetchClientDataById', res, error);
    }
};
