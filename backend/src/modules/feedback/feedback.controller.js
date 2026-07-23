import multer from 'multer';
import * as feedbackService from "./feedback.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/errorHelper.js";

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
                return reject(new HttpError(err.message || "Error while uploading images", 400, 'IMAGE_UPLOAD_ERROR'));
            }
            resolve();
        });
    });
};

export const createFeedback = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });

    await handleImageUpload(req);
    const response = await feedbackService.createFeedback(clientId, req.body, req.files);
    return res.status(201).json(response);
});

export const updateFeedback = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });

    await handleImageUpload(req);
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.updateFeedback(clientId, feedbackId, req.body, req.files);
    return res.status(200).json(response);
});

export const updateFeedbackType = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.updateFeedbackType(clientId, feedbackId, req.body);
    return res.status(200).json(response);
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.updateFeedbackStatus(clientId, feedbackId, req.body);
    return res.status(200).json(response);
});

export const fetchClientFeedback = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const response = await feedbackService.fetchClientFeedback(clientId, req.query);
    return res.status(200).json(response);
});

export const fetchFeedbackById = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.fetchFeedbackById(clientId, feedbackId);
    return res.status(200).json(response);
});

export const createFeedbackImages = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });

    await handleImageUpload(req);
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.createFeedbackImages(clientId, feedbackId, req.files);
    return res.status(201).json(response);
});

export const deleteFeedbackImage = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const { feedback_id: feedbackId, image_id: imageId } = req.params;
    const response = await feedbackService.deleteFeedbackImage(clientId, feedbackId, imageId);
    return res.status(200).json(response);
});

export const createComment = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.createComment(clientId, feedbackId, req.body);
    return res.status(201).json(response);
});

export const updateComment = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const { feedback_id: feedbackId, comment_id: commentId } = req.params;
    const response = await feedbackService.updateComment(clientId, feedbackId, commentId, req.body);
    return res.status(200).json(response);
});

export const deleteComment = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const { feedback_id: feedbackId, comment_id: commentId } = req.params;
    const response = await feedbackService.deleteComment(clientId, feedbackId, commentId);
    return res.status(200).json(response);
});

export const fetchFeedbackStats = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    if (!clientId) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    const response = await feedbackService.fetchFeedbackStats(clientId);
    return res.status(200).json(response);
});

export const fetchFeedbackMetadata = asyncHandler(async (req, res) => {
    const response = await feedbackService.fetchFeedbackMetadata();
    return res.status(200).json(response);
});

export const fetchAllFeedback = asyncHandler(async (req, res) => {
    const response = await feedbackService.fetchAllFeedback(req.query);
    return res.status(200).json(response);
});

export const fetchAdminFeedbackById = asyncHandler(async (req, res) => {
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.fetchAdminFeedbackById(feedbackId);
    return res.status(200).json(response);
});

export const updateFeedbackStatusAdmin = asyncHandler(async (req, res) => {
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.updateFeedbackStatusAdmin(feedbackId, req.body);
    return res.status(200).json(response);
});

export const updateFeedbackAssignment = asyncHandler(async (req, res) => {
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.updateFeedbackAssignment(feedbackId, req.body);
    return res.status(200).json(response);
});

export const createAdminComment = asyncHandler(async (req, res) => {
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.createAdminComment(feedbackId, req.body);
    return res.status(201).json(response);
});

export const updateAdminComment = asyncHandler(async (req, res) => {
    const { feedback_id: feedbackId, comment_id: commentId } = req.params;
    const response = await feedbackService.updateAdminComment(feedbackId, commentId, req.body);
    return res.status(200).json(response);
});

export const deleteAdminComment = asyncHandler(async (req, res) => {
    const { feedback_id: feedbackId, comment_id: commentId } = req.params;
    const response = await feedbackService.deleteAdminComment(feedbackId, commentId, req.body);
    return res.status(200).json(response);
});

export const createAdminFeedbackImages = asyncHandler(async (req, res) => {
    await handleImageUpload(req);
    const { feedback_id: feedbackId } = req.params;
    const response = await feedbackService.createAdminFeedbackImages(feedbackId, req.files);
    return res.status(201).json(response);
});

export const fetchAdminFeedbackStats = asyncHandler(async (req, res) => {
    const response = await feedbackService.fetchAdminFeedbackStats(req.query);
    return res.status(200).json(response);
});
