import multer from 'multer';
import * as feedbackService from "./feedback.service.js";
import { handleError } from "../../utils/errorHelper.js";

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, WEBP, and GIF files are allowed'));
        }
        cb(null, true);
    }
});

const handleImageUpload = (req) => {
    return new Promise((resolve, reject) => {
        upload.array('images', 5)(req, req.res, (err) => {
            if (err) {
                return reject(new Error(err.message || "Error while uploading images"));
            }
            resolve();
        });
    });
};

// ===== CLIENT CONTROLLERS =====

export const createFeedback = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });

        await handleImageUpload(req);
        const response = await feedbackService.createFeedback(clientId, req.body, req.files);
        return res.status(201).json(response);
    } catch (error) {
        if (error.message?.includes('upload') || error.message?.includes('images')) {
            return res.status(400).json({ status: "error", code: "IMAGE_UPLOAD_ERROR", message: error.message });
        }
        handleError('feedback.controller.js', 'createFeedback', res, error, error.message);
    }
};

export const updateFeedback = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });

        await handleImageUpload(req);
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.updateFeedback(clientId, feedbackId, req.body, req.files);
        return res.status(200).json(response);
    } catch (error) {
        if (error.message?.includes('upload') || error.message?.includes('images')) {
            return res.status(400).json({ status: "error", code: "IMAGE_UPLOAD_ERROR", message: error.message });
        }
        handleError('feedback.controller.js', 'updateFeedback', res, error, error.message);
    }
};

export const updateFeedbackType = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.updateFeedbackType(clientId, feedbackId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'updateFeedbackType', res, error, error.message);
    }
};

export const updateFeedbackStatus = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.updateFeedbackStatus(clientId, feedbackId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'updateFeedbackStatus', res, error, error.message);
    }
};

export const fetchClientFeedback = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const response = await feedbackService.fetchClientFeedback(clientId, req.query);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'fetchClientFeedback', res, error, error.message);
    }
};

export const fetchFeedbackById = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.fetchFeedbackById(clientId, feedbackId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'fetchFeedbackById', res, error, error.message);
    }
};

export const createFeedbackImages = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });

        await handleImageUpload(req);
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.createFeedbackImages(clientId, feedbackId, req.files);
        return res.status(201).json(response);
    } catch (error) {
        if (error.message?.includes('upload') || error.message?.includes('images')) {
            return res.status(400).json({ status: "error", code: "IMAGE_UPLOAD_ERROR", message: error.message });
        }
        handleError('feedback.controller.js', 'createFeedbackImages', res, error, error.message);
    }
};

export const deleteFeedbackImage = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const { feedback_id: feedbackId, image_id: imageId } = req.params;
        const response = await feedbackService.deleteFeedbackImage(clientId, feedbackId, imageId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'deleteFeedbackImage', res, error, error.message);
    }
};

export const createComment = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.createComment(clientId, feedbackId, req.body);
        return res.status(201).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'createComment', res, error, error.message);
    }
};

export const updateComment = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const { feedback_id: feedbackId, comment_id: commentId } = req.params;
        const response = await feedbackService.updateComment(clientId, feedbackId, commentId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'updateComment', res, error, error.message);
    }
};

export const deleteComment = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const { feedback_id: feedbackId, comment_id: commentId } = req.params;
        const response = await feedbackService.deleteComment(clientId, feedbackId, commentId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'deleteComment', res, error, error.message);
    }
};

export const fetchFeedbackStats = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        const response = await feedbackService.fetchFeedbackStats(clientId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'fetchFeedbackStats', res, error, error.message);
    }
};

export const fetchFeedbackMetadata = async (req, res) => {
    try {
        const response = await feedbackService.fetchFeedbackMetadata();
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'fetchFeedbackMetadata', res, error, error.message);
    }
};

// ===== ADMIN CONTROLLERS =====

export const fetchAllFeedback = async (req, res) => {
    try {
        const response = await feedbackService.fetchAllFeedback(req.query);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'fetchAllFeedback', res, error, error.message);
    }
};

export const fetchAdminFeedbackById = async (req, res) => {
    try {
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.fetchAdminFeedbackById(feedbackId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'fetchAdminFeedbackById', res, error, error.message);
    }
};

export const updateFeedbackStatusAdmin = async (req, res) => {
    try {
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.updateFeedbackStatusAdmin(feedbackId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'updateFeedbackStatusAdmin', res, error, error.message);
    }
};

export const updateFeedbackAssignment = async (req, res) => {
    try {
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.updateFeedbackAssignment(feedbackId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'updateFeedbackAssignment', res, error, error.message);
    }
};

export const createAdminComment = async (req, res) => {
    try {
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.createAdminComment(feedbackId, req.body);
        return res.status(201).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'createAdminComment', res, error, error.message);
    }
};

export const updateAdminComment = async (req, res) => {
    try {
        const { feedback_id: feedbackId, comment_id: commentId } = req.params;
        const response = await feedbackService.updateAdminComment(feedbackId, commentId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'updateAdminComment', res, error, error.message);
    }
};

export const deleteAdminComment = async (req, res) => {
    try {
        const { feedback_id: feedbackId, comment_id: commentId } = req.params;
        const response = await feedbackService.deleteAdminComment(feedbackId, commentId, req.body);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'deleteAdminComment', res, error, error.message);
    }
};

export const createAdminFeedbackImages = async (req, res) => {
    try {
        await handleImageUpload(req);
        const { feedback_id: feedbackId } = req.params;
        const response = await feedbackService.createAdminFeedbackImages(feedbackId, req.files);
        return res.status(201).json(response);
    } catch (error) {
        if (error.message?.includes('upload') || error.message?.includes('images')) {
            return res.status(400).json({ status: "error", code: "IMAGE_UPLOAD_ERROR", message: error.message });
        }
        handleError('feedback.controller.js', 'createAdminFeedbackImages', res, error, error.message);
    }
};

export const fetchAdminFeedbackStats = async (req, res) => {
    try {
        const response = await feedbackService.fetchAdminFeedbackStats(req.query);
        return res.status(200).json(response);
    } catch (error) {
        handleError('feedback.controller.js', 'fetchAdminFeedbackStats', res, error, error.message);
    }
};
