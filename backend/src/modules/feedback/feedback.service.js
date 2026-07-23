import { v4 as uuidv4 } from 'uuid';
import * as feedbackRepository from "./feedback.repository.js";
import { uploadObject, getSignedUrl, deleteObject } from "../../providers/minio/minio.provider.js";
import { HttpError } from "../../utils/errorHelper.js";
import { convertEmptyStringsToNull } from "../../utils/convertEmptyStringsToNull.js";

const VALID_FEEDBACK_TYPES = ['complaint', 'bug', 'suggestion', 'billing', 'feature_request'];
const VALID_FEEDBACK_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];
const CLIENT_ALLOWED_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

const checkFeedbackOwnership = async (feedbackId, clientId = null) => {
    return await feedbackRepository.findFeedbackById(feedbackId, clientId);
};

const checkFeedbackExists = async (feedbackId) => {
    return await feedbackRepository.findFeedbackExists(feedbackId);
};

const processImageUploads = async (files, feedbackId, uploadedBy = 'client') => {
    const uploadedImages = [];
    if (!files || files.length === 0) return uploadedImages;

    for (const file of files) {
        try {
            const imageId = uuidv4();
            const { originalname, buffer, mimetype, size } = file;
            const fileName = `${imageId}_${Date.now()}_${originalname}`;
            const key = `support/images/${fileName}`;
            await uploadObject(buffer, key, mimetype);
            await feedbackRepository.createFeedbackImage(imageId, feedbackId, key, originalname, size, mimetype, uploadedBy);
            uploadedImages.push({ id: imageId, filename: originalname, url: key, file_size: size, file_type: mimetype });
        } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
        }
    }
    return uploadedImages;
};

const generateSignedUrls = async (images) => {
    for (const image of images) {
        try {
            image.signed_url = await getSignedUrl(image.image_url, 86400);
        } catch (err) {
            console.error("Error generating signed URL:", err);
            image.signed_url = null;
        }
    }
    return images;
};

// ===== CLIENT SERVICE FUNCTIONS =====

export const createFeedback = async (clientId, body, files) => {
    const { type, title, description } = convertEmptyStringsToNull(body);

    if (!type || !title || !description) {
        throw new HttpError("Type, title, and description are required", 400);
    }
    if (!VALID_FEEDBACK_TYPES.includes(type)) {
        throw new HttpError("Invalid feedback type. Valid types: " + VALID_FEEDBACK_TYPES.join(', '), 400);
    }

    const feedbackId = uuidv4();
    const result = await feedbackRepository.createFeedback(feedbackId, clientId, type, title, description);
    if (result?.affectedRows === 0) {
        throw new HttpError("Failed to create feedback", 400);
    }

    const uploadedImages = await processImageUploads(files, feedbackId, 'client');

    return {
        status: 'success',
        message: 'Feedback created successfully',
        data: { feedback_id: feedbackId, uploaded_images: uploadedImages }
    };
};

export const updateFeedback = async (clientId, feedbackId, body, files) => {
    const { type, title, description } = convertEmptyStringsToNull(body);

    const feedback = await checkFeedbackOwnership(feedbackId, clientId);
    if (!feedback) {
        throw new HttpError("Feedback not found or you do not have permission to update it", 404);
    }
    if (['resolved', 'closed'].includes(feedback.status)) {
        throw new HttpError("Cannot update resolved or closed feedback", 400);
    }
    if (!type && !title && !description) {
        throw new HttpError("At least one field (type, title, description) is required for update", 400);
    }
    if (type && !VALID_FEEDBACK_TYPES.includes(type)) {
        throw new HttpError("Invalid feedback type. Valid types: " + VALID_FEEDBACK_TYPES.join(', '), 400);
    }

    let updateFields = [];
    let updateParams = [];
    if (type) { updateFields.push('type = ?'); updateParams.push(type); }
    if (title) { updateFields.push('title = ?'); updateParams.push(title); }
    if (description) { updateFields.push('description = ?'); updateParams.push(description); }

    const result = await feedbackRepository.updateFeedbackById(feedbackId, clientId, updateFields, updateParams);
    const uploadedImages = await processImageUploads(files, feedbackId, 'client');

    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Feedback updated successfully', uploaded_images: uploadedImages, result };
    }
    throw new HttpError("Failed to update feedback", 400);
};

export const updateFeedbackType = async (clientId, feedbackId, body) => {
    const { type } = convertEmptyStringsToNull(body);
    if (!type) throw new HttpError("Type is required", 400);
    if (!VALID_FEEDBACK_TYPES.includes(type)) {
        throw new HttpError("Invalid feedback type. Valid types: " + VALID_FEEDBACK_TYPES.join(', '), 400);
    }

    const feedback = await checkFeedbackOwnership(feedbackId, clientId);
    if (!feedback) throw new HttpError("Feedback not found", 404);
    if (['resolved', 'closed'].includes(feedback.status)) {
        throw new HttpError("Cannot update resolved or closed feedback", 400);
    }

    const result = await feedbackRepository.updateFeedbackTypeById(feedbackId, type);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Feedback type updated successfully' };
    }
    throw new HttpError("Failed to update feedback type", 400);
};

export const updateFeedbackStatus = async (clientId, feedbackId, body) => {
    const { status, satisfaction_rating } = convertEmptyStringsToNull(body);
    const isAdmin = process.env.SUPER_ADMIN_ID === clientId;

    if (!isAdmin) throw new HttpError("You do not have permission to update it", 401);
    if (!status) throw new HttpError("Status is required", 400);
    if (!CLIENT_ALLOWED_STATUSES.includes(status)) {
        throw new HttpError("Invalid status. Clients can only close or cancel tickets.", 400);
    }

    const feedback = await checkFeedbackOwnership(feedbackId);
    if (!feedback) throw new HttpError("Feedback not found", 404);

    let additionalFields = [];
    let additionalParams = [];

    if (status === 'closed' && satisfaction_rating) {
        if (satisfaction_rating < 1 || satisfaction_rating > 5) {
            throw new HttpError("Satisfaction rating must be between 1 and 5", 400);
        }
        additionalFields.push('client_satisfaction_rating = ?', 'resolved_at = NOW()');
        additionalParams.push(satisfaction_rating);
    } else if (status === 'closed') {
        additionalFields.push('resolved_at = NOW()');
    }

    const result = await feedbackRepository.updateFeedbackStatusById(feedbackId, status, additionalFields, additionalParams);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Feedback status updated successfully' };
    }
    throw new HttpError("Failed to update feedback status", 400);
};

export const fetchClientFeedback = async (clientId, query) => {
    const { page = 1, limit = 10, status, type, search } = query;
    const offset = (page - 1) * limit;
    const isAdmin = process.env.SUPER_ADMIN_ID === clientId;

    let whereClause = 'WHERE 1=1 ';
    let queryParams = [];

    if (!isAdmin) {
        whereClause += ' AND cf.client_id = ? ';
        queryParams.push(clientId);
    }
    if (status) { whereClause += ' AND cf.status = ?'; queryParams.push(status); }
    if (type) { whereClause += ' AND cf.type = ?'; queryParams.push(type); }
    if (search) { whereClause += ' AND (cf.title LIKE ? OR cf.description LIKE ?)'; queryParams.push(`%${search}%`, `%${search}%`); }

    const feedbackResult = await feedbackRepository.findClientFeedback(clientId, isAdmin, whereClause, queryParams, parseInt(limit), parseInt(offset));
    const countResult = await feedbackRepository.countClientFeedback(clientId, isAdmin, whereClause, queryParams);
    const total = countResult[0]?.total || 0;

    return {
        status: 'success',
        data: feedbackResult,
        pagination: { current_page: parseInt(page), per_page: parseInt(limit), total, total_pages: Math.ceil(total / limit) }
    };
};

export const fetchFeedbackById = async (clientId, feedbackId) => {
    const isAdmin = process.env.SUPER_ADMIN_ID === clientId;

    let whereClause = '';
    let queryParams = [feedbackId];
    if (!isAdmin) {
        whereClause = ' AND cf.client_id = ? ';
        queryParams.push(clientId);
    }

    const feedbackResult = await feedbackRepository.findFeedbackDetailById(feedbackId, clientId, isAdmin);
    if (feedbackResult.length === 0) {
        throw new HttpError("Feedback not found", 404);
    }

    const feedback = feedbackResult[0];
    const comments = await feedbackRepository.findFeedbackComments(feedbackId);
    const images = await feedbackRepository.findFeedbackImages(feedbackId);
    await generateSignedUrls(images);

    return { status: 'success', data: { feedback, comments, images } };
};

export const createFeedbackImages = async (clientId, feedbackId, files) => {
    const feedback = await checkFeedbackOwnership(feedbackId, clientId);
    if (!feedback) throw new HttpError("Feedback not found", 404);
    if (!files || files.length === 0) throw new HttpError("No images provided", 400);

    const uploadedImages = await processImageUploads(files, feedbackId, 'client');
    return { status: 'success', message: 'Images added successfully', data: { uploaded_images: uploadedImages } };
};

export const deleteFeedbackImage = async (clientId, feedbackId, imageId) => {
    const imageResult = await feedbackRepository.findImageById(imageId, feedbackId, clientId);
    if (imageResult.length === 0) {
        throw new HttpError("Image not found or you do not have permission to delete it", 404);
    }

    const image = imageResult[0];
    try { await deleteObject(image.image_url); } catch (s3Error) { console.error("Error deleting from MinIO:", s3Error); }

    const deleteResult = await feedbackRepository.deleteImageById(imageId);
    if (deleteResult?.affectedRows > 0) {
        return { status: 'success', message: 'Image deleted successfully' };
    }
    throw new HttpError("Failed to delete image", 400);
};

export const createComment = async (clientId, feedbackId, body) => {
    const { comment, parent_comment_id } = convertEmptyStringsToNull(body);
    const isAdmin = process.env.SUPER_ADMIN_ID === clientId;

    if (!comment) throw new HttpError("Comment is required", 400);

    const feedback = await checkFeedbackOwnership(feedbackId);
    if (!feedback) throw new HttpError("Feedback not found", 404);

    if (parent_comment_id) {
        const parentCheck = await feedbackRepository.findParentComment(parent_comment_id, feedbackId);
        if (parentCheck.length === 0) throw new HttpError("Parent comment not found", 400);
    }

    const commentId = uuidv4();
    const commentedBy = isAdmin ? "admin" : "client";
    const result = await feedbackRepository.createComment(commentId, feedbackId, commentedBy, clientId, comment, parent_comment_id);

    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Comment added successfully', data: { comment_id: commentId } };
    }
    throw new HttpError("Failed to add comment", 400);
};

export const updateComment = async (clientId, feedbackId, commentId, body) => {
    const { comment } = convertEmptyStringsToNull(body);
    const isAdmin = process.env.SUPER_ADMIN_ID === clientId;
    if (!comment) throw new HttpError("Comment is required", 400);

    const commentedBy = isAdmin ? "admin" : "client";
    const commentCheck = await feedbackRepository.findCommentForUpdate(commentId, feedbackId, clientId, commentedBy);
    if (commentCheck.length === 0) {
        throw new HttpError("Comment not found or you do not have permission to update it", 404);
    }

    const result = await feedbackRepository.updateCommentById(commentId, feedbackId, clientId, comment);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Comment updated successfully' };
    }
    throw new HttpError("Failed to update comment", 400);
};

export const deleteComment = async (clientId, feedbackId, commentId) => {
    const isAdmin = process.env.SUPER_ADMIN_ID === clientId;
    const commentedBy = isAdmin ? "admin" : "client";
    const commentCheck = await feedbackRepository.findCommentForUpdate(commentId, feedbackId, clientId, commentedBy);
    if (commentCheck.length === 0) {
        throw new HttpError("Comment not found or you do not have permission to delete it", 404);
    }

    const result = await feedbackRepository.deleteCommentById(commentId, feedbackId, clientId);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Comment deleted successfully' };
    }
    throw new HttpError("Failed to delete comment", 400);
};

export const fetchFeedbackStats = async (clientId) => {
    const isAdmin = process.env.SUPER_ADMIN_ID === clientId;
    const statsResult = await feedbackRepository.findFeedbackStats(clientId, isAdmin);
    return { status: 'success', data: statsResult[0] };
};

export const fetchFeedbackMetadata = async () => {
    return {
        status: 'success',
        data: {
            types: VALID_FEEDBACK_TYPES,
            statuses: VALID_FEEDBACK_STATUSES,
            client_allowed_statuses: CLIENT_ALLOWED_STATUSES
        }
    };
};

// ===== ADMIN SERVICE FUNCTIONS =====

export const fetchAllFeedback = async (query) => {
    const {
        page = 1, limit = 10, status, type, client_id,
        assigned_to_admin_id, search, date_from, date_to,
        sort_by = 'created_at', sort_order = 'DESC'
    } = query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (status) { whereClause += ' AND cf.status = ?'; queryParams.push(status); }
    if (type) { whereClause += ' AND cf.type = ?'; queryParams.push(type); }
    if (client_id) { whereClause += ' AND cf.client_id = ?'; queryParams.push(client_id); }
    if (assigned_to_admin_id) { whereClause += ' AND cf.assigned_to_admin_id = ?'; queryParams.push(assigned_to_admin_id); }
    if (search) { whereClause += ' AND (cf.title LIKE ? OR cf.description LIKE ? OR CONCAT(c.first_name, " ", c.last_name) LIKE ? OR c.cafe_name LIKE ?)'; queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
    if (date_from) { whereClause += ' AND cf.created_at >= ?'; queryParams.push(date_from); }
    if (date_to) { whereClause += ' AND cf.created_at <= ?'; queryParams.push(date_to + ' 23:59:59'); }

    const validSortFields = ['created_at', 'updated_at', 'status', 'type', 'title', 'client_name'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

    const feedbackResult = await feedbackRepository.findAllFeedback(whereClause, queryParams, parseInt(limit), parseInt(offset), sortField, sortDirection);
    const countResult = await feedbackRepository.countAllFeedback(whereClause, queryParams);
    const total = countResult[0]?.total || 0;

    return {
        status: 'success',
        data: feedbackResult,
        pagination: { current_page: parseInt(page), per_page: parseInt(limit), total, total_pages: Math.ceil(total / limit) }
    };
};

export const fetchAdminFeedbackById = async (feedbackId) => {
    const feedbackResult = await feedbackRepository.findAdminFeedbackById(feedbackId);
    if (feedbackResult.length === 0) throw new HttpError("Feedback not found", 404);

    const feedback = feedbackResult[0];
    const comments = await feedbackRepository.findAdminFeedbackComments(feedbackId, feedback.client_id);
    const images = await feedbackRepository.findAdminFeedbackImages(feedbackId);
    await generateSignedUrls(images);

    return { status: 'success', data: { feedback, comments, images } };
};

export const updateFeedbackStatusAdmin = async (feedbackId, body) => {
    const { status, admin_id } = convertEmptyStringsToNull(body);
    if (!status) throw new HttpError("Status is required", 400);
    if (!VALID_FEEDBACK_STATUSES.includes(status)) {
        throw new HttpError("Invalid status. Valid statuses: " + VALID_FEEDBACK_STATUSES.join(', '), 400);
    }

    const feedback = await checkFeedbackExists(feedbackId);
    if (!feedback) throw new HttpError("Feedback not found", 404);

    let additionalFields = [];
    let additionalParams = [];
    if (status === 'resolved' || status === 'closed') {
        additionalFields.push('resolved_at = NOW()');
    }

    const result = await feedbackRepository.updateAdminFeedbackStatus(feedbackId, status, admin_id, additionalFields, additionalParams);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Feedback status updated successfully' };
    }
    throw new HttpError("Failed to update feedback status", 400);
};

export const updateFeedbackAssignment = async (feedbackId, body) => {
    const { admin_id } = convertEmptyStringsToNull(body);
    if (!admin_id) throw new HttpError("Admin ID is required", 400);

    const feedback = await checkFeedbackExists(feedbackId);
    if (!feedback) throw new HttpError("Feedback not found", 404);

    const result = await feedbackRepository.updateFeedbackAssignment(feedbackId, admin_id);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Feedback assigned successfully' };
    }
    throw new HttpError("Failed to assign feedback", 400);
};

export const createAdminComment = async (feedbackId, body) => {
    const { comment, admin_id, is_internal = false, parent_comment_id } = convertEmptyStringsToNull(body);
    if (!comment) throw new HttpError("Comment is required", 400);
    if (!admin_id) throw new HttpError("Admin ID is required", 400);

    const feedback = await checkFeedbackExists(feedbackId);
    if (!feedback) throw new HttpError("Feedback not found", 404);

    if (parent_comment_id) {
        const parentCheck = await feedbackRepository.findAdminParentComment(parent_comment_id, feedbackId);
        if (parentCheck.length === 0) throw new HttpError("Parent comment not found", 400);
    }

    const commentId = uuidv4();
    const result = await feedbackRepository.createAdminComment(commentId, feedbackId, admin_id, comment, parent_comment_id, is_internal);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Comment added successfully', data: { comment_id: commentId } };
    }
    throw new HttpError("Failed to add comment", 400);
};

export const updateAdminComment = async (feedbackId, commentId, body) => {
    const { comment, admin_id } = convertEmptyStringsToNull(body);
    if (!comment) throw new HttpError("Comment is required", 400);
    if (!admin_id) throw new HttpError("Admin ID is required", 400);

    const commentCheck = await feedbackRepository.findAdminCommentForUpdate(commentId, feedbackId, admin_id);
    if (commentCheck.length === 0) {
        throw new HttpError("Comment not found or you do not have permission to update it", 404);
    }

    const result = await feedbackRepository.updateAdminCommentById(commentId, feedbackId, comment);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Comment updated successfully' };
    }
    throw new HttpError("Failed to update comment", 400);
};

export const deleteAdminComment = async (feedbackId, commentId, body) => {
    const { admin_id } = convertEmptyStringsToNull(body);
    if (!admin_id) throw new HttpError("Admin ID is required", 400);

    const commentCheck = await feedbackRepository.findAdminCommentForUpdate(commentId, feedbackId, admin_id);
    if (commentCheck.length === 0) {
        throw new HttpError("Comment not found or you do not have permission to delete it", 404);
    }

    const result = await feedbackRepository.deleteAdminCommentById(commentId, feedbackId);
    if (result?.affectedRows > 0) {
        return { status: 'success', message: 'Comment deleted successfully' };
    }
    throw new HttpError("Failed to delete comment", 400);
};

export const createAdminFeedbackImages = async (feedbackId, files) => {
    const feedback = await checkFeedbackExists(feedbackId);
    if (!feedback) throw new HttpError("Feedback not found", 404);
    if (!files || files.length === 0) throw new HttpError("No images provided", 400);

    const uploadedImages = await processImageUploads(files, feedbackId, 'admin');
    return { status: 'success', message: 'Images added successfully', data: { uploaded_images: uploadedImages } };
};

export const fetchAdminFeedbackStats = async (query) => {
    const { admin_id, date_from, date_to } = query;
    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (admin_id) { whereClause += ' AND assigned_to_admin_id = ?'; queryParams.push(admin_id); }
    if (date_from) { whereClause += ' AND created_at >= ?'; queryParams.push(date_from); }
    if (date_to) { whereClause += ' AND created_at <= ?'; queryParams.push(date_to + ' 23:59:59'); }

    const data = await feedbackRepository.findAdminFeedbackStats(whereClause, queryParams);
    return { status: 'success', data };
};
