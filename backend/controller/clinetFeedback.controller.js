import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import query from '../utils/query.utils.js';
import { handleError } from '../utils/utils.js';
import { convertEmptyStringsToNull } from '../utils/convertEmptyStringsToNull.js';
import { uploadstreamToS3, getSignedUrlFromS3, deleteObjectFromS3 } from '../services/r2/r2.service.js';

// =================
// MULTER CONFIGURATION
// =================

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, WEBP, and GIF files are allowed'));
        }
        cb(null, true);
    }
});

// =================
// CONSTANTS
// =================

const VALID_FEEDBACK_TYPES = ['complaint', 'bug', 'suggestion', 'billing', 'feature_request'];
const VALID_FEEDBACK_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];
const CLIENT_ALLOWED_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

// =================
// REUSABLE VALIDATION FUNCTIONS
// =================

const validateFeedbackType = (type) => VALID_FEEDBACK_TYPES.includes(type);
const validateFeedbackStatus = (status) => VALID_FEEDBACK_STATUSES.includes(status);
const validateClientStatus = (status) => CLIENT_ALLOWED_STATUSES.includes(status);
const validateSatisfactionRating = (rating) => rating >= 1 && rating <= 5;

// =================
// REUSABLE UTILITY FUNCTIONS
// =================

const verifyFeedbackOwnership = async (feedback_id, client_id) => {
    var sql = 'SELECT id, status, type, title, description FROM client_feedback WHERE unique_id = ? '
    var value = [feedback_id]
    if (client_id) {
        sql += ` AND client_id = ?`
        value.push(client_id)
    }
    const result = await query(sql, value);
    return result.length > 0 ? result[0] : null;
};

const checkFeedbackExists = async (feedback_id) => {
    const result = await query(
        'SELECT id, client_id, status FROM client_feedback WHERE unique_id = ?',
        [feedback_id]
    );
    return result.length > 0 ? result[0] : null;
};

const processImageUploads = async (files, feedback_id, uploaded_by = 'client') => {
    const uploadedImages = [];

    if (!files || files.length === 0) return uploadedImages;

    for (const file of files) {
        try {
            const imageId = uuidv4();
            const { originalname, buffer, mimetype, size } = file;
            const fileName = `${imageId}_${Date.now()}_${originalname}`;
            const key = `support/images/${fileName}`;

            await uploadstreamToS3(buffer, { folder: key }, mimetype);

            const imageSql = `
                INSERT INTO client_feedback_images 
                (unique_id, feedback_id, image_url, original_filename, file_size_bytes, file_type, uploaded_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await query(imageSql, [imageId, feedback_id, key, originalname, size, mimetype, uploaded_by]);

            uploadedImages.push({
                id: imageId,
                filename: originalname,
                url: key,
                file_size: size,
                file_type: mimetype
            });
        } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
        }
    }

    return uploadedImages;
};

const generateSignedUrls = async (images) => {
    for (const image of images) {
        try {
            const signedUrl = await getSignedUrlFromS3(image.image_url, 86400);
            image.signed_url = signedUrl;
        } catch (err) {
            console.error("Error generating signed URL:", err);
            image.signed_url = null;
        }
    }
    return images;
};

// =================
// CLIENT CONTROLLERS
// =================

export const createFeedback = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        await new Promise((resolve, reject) => {
            upload.array('images', 5)(req, res, (err) => {
                if (err) {
                    console.error("createFeedback - Error uploading images:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading images"
                    });
                }
                resolve();
            });
        });

        const { type, title, description } = convertEmptyStringsToNull(req.body);

        if (!type || !title || !description) {
            return res.status(400).json({ status: 'error', message: 'Type, title, and description are required' });
        }

        if (!validateFeedbackType(type)) {
            return res.status(400).json({ status: 'error', message: 'Invalid feedback type. Valid types: ' + VALID_FEEDBACK_TYPES.join(', ') });
        }

        const feedbackId = uuidv4();
        const feedbackSql = `
            INSERT INTO client_feedback (unique_id, client_id, type, title, description) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const feedbackResult = await query(feedbackSql, [feedbackId, client_id, type, title, description]);

        if (feedbackResult?.affectedRows === 0) {
            return res.status(400).json({ message: 'Failed to create feedback' });
        }

        const uploadedImages = await processImageUploads(req.files, feedbackId, 'client');

        return res.status(201).json({
            status: 'success',
            message: 'Feedback created successfully',
            data: {
                feedback_id: feedbackId,
                uploaded_images: uploadedImages
            }
        });
    } catch (error) {
        handleError('support.controller.js', 'createFeedback', res, error, error.message);
    }
};

export const updateFeedback = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id } = req.params;

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        await new Promise((resolve, reject) => {
            upload.array('images', 5)(req, res, (err) => {
                if (err) {
                    console.error("createFeedback - Error uploading images:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading images"
                    });
                }
                resolve();
            });
        });

        const { type, title, description } = convertEmptyStringsToNull(req.body);

        const feedback = await verifyFeedbackOwnership(feedback_id, client_id);
        if (!feedback) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback not found or you do not have permission to update it'
            });
        }

        if (['resolved', 'closed'].includes(feedback.status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot update resolved or closed feedback'
            });
        }

        if (!type && !title && !description) {
            return res.status(400).json({
                status: 'error',
                message: 'At least one field (type, title, description) is required for update'
            });
        }

        if (type && !validateFeedbackType(type)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid feedback type. Valid types: ' + VALID_FEEDBACK_TYPES.join(', ')
            });
        }

        let updateFields = [];
        let updateParams = [];

        if (type) {
            updateFields.push('type = ?');
            updateParams.push(type);
        }
        if (title) {
            updateFields.push('title = ?');
            updateParams.push(title);
        }
        if (description) {
            updateFields.push('description = ?');
            updateParams.push(description);
        }

        updateParams.push(feedback_id, client_id);

        const updateSql = `UPDATE client_feedback  SET ${updateFields.join(', ')}, updated_at = NOW() WHERE unique_id = ? AND client_id = ?`;
        const result = await query(updateSql, updateParams);

        const uploadedImages = await processImageUploads(req.files, feedback_id, 'client');

        if (result?.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Feedback updated successfully', uploaded_images: uploadedImages, result: result });
        } else {
            return res.status(400).json({ message: 'Failed to update feedback' });
        }
    } catch (error) {
        handleError('support.controller.js', 'updateFeedback', res, error, error.message);
    }
};

export const updateFeedbackType = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id } = req.params;
        const { type } = convertEmptyStringsToNull(req.body);

        if (!type) {
            return res.status(400).json({ status: 'error', message: 'Type is required' });
        }

        if (!validateFeedbackType(type)) {
            return res.status(400).json({ status: 'error', message: 'Invalid feedback type. Valid types: ' + VALID_FEEDBACK_TYPES.join(', ') });
        }

        const feedback = await verifyFeedbackOwnership(feedback_id, client_id);

        if (!feedback) {
            return res.status(404).json({ status: 'error', message: 'Feedback not found' });
        }

        if (['resolved', 'closed'].includes(feedback.status)) {
            return res.status(400).json({ status: 'error', message: 'Cannot update resolved or closed feedback' });
        }

        const updateSql = ` UPDATE client_feedback  SET type = ?, updated_at = NOW() WHERE unique_id = ?`;
        const result = await query(updateSql, [type, feedback_id]);

        if (result?.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Feedback type updated successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to update feedback type' });
        }
    } catch (error) {
        handleError('support.controller.js', 'updateFeedbackType', res, error, error.message);
    }
};

export const updateFeedbackStatus = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id } = req.params;
        const { status, satisfaction_rating } = convertEmptyStringsToNull(req.body);
        const isAdmin = process.env.SUPER_ADMIN_ID === client_id

        if (!isAdmin) {
            return res.status(401).json({ status: 'error', code: 'UNAUTHORIZED', message: 'you do not have permission to update it' });
        }

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        if (!status) {
            return res.status(400).json({ status: 'error', message: 'Status is required' });
        }

        if (!validateClientStatus(status)) {
            return res.status(400).json({ status: 'error', message: 'Invalid status. Clients can only close or cancel tickets.' });
        }

        const feedback = await verifyFeedbackOwnership(feedback_id);
        if (!feedback) {
            return res.status(404).json({ status: 'error', message: 'Feedback not found' });
        }

        let updateSql = 'UPDATE client_feedback SET status = ?';
        let updateParams = [status];

        if (status === 'closed' && satisfaction_rating) {
            if (!validateSatisfactionRating(satisfaction_rating)) {
                return res.status(400).json({ status: 'error', message: 'Satisfaction rating must be between 1 and 5' });
            }
            updateSql += ', client_satisfaction_rating = ?, resolved_at = NOW()';
            updateParams.push(satisfaction_rating);
        } else if (status === 'closed') {
            updateSql += ', resolved_at = NOW()';
        }

        updateSql += ', updated_at = NOW() WHERE unique_id = ?';
        updateParams.push(feedback_id, client_id);

        const result = await query(updateSql);

        if (result?.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Feedback status updated successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to update feedback status' });
        }
    } catch (error) {
        handleError('support.controller.js', 'updateFeedbackStatus', res, error, error.message);
    }
};

export const getClientFeedback = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { page = 1, limit = 10, status, type, search } = req.query;

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1 ';
        let queryParams = [];

        if (process.env.SUPER_ADMIN_ID !== client_id) {
            whereClause += ' AND cf.client_id = ? ';
            queryParams.push(client_id);
        }

        if (status) {
            whereClause += ' AND cf.status = ?';
            queryParams.push(status);
        }
        if (type) {
            whereClause += ' AND cf.type = ?';
            queryParams.push(type);
        }
        if (search) {
            whereClause += ' AND (cf.title LIKE ? OR cf.description LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const feedbackSql = `
            SELECT cf.*, 
                    own.first_name,
                    own.last_name,
                    own.email,
                    COUNT(DISTINCT fc.id) as comment_count,
                    COUNT(DISTINCT cfi.id) as image_count
            FROM client_feedback cf
            LEFT JOIN feedback_comments fc ON cf.unique_id = fc.feedback_id AND fc.is_internal = FALSE
            LEFT JOIN client_feedback_images cfi ON cf.unique_id = cfi.feedback_id
            LEFT JOIN clients own on cf.client_id = own.unique_id
            ${whereClause}
            GROUP BY cf.id
            ORDER BY cf.created_at DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(parseInt(limit), parseInt(offset));

        const feedbackResult = await query(feedbackSql, queryParams);

        const countSql = `SELECT COUNT(*) as total FROM client_feedback cf ${whereClause}`;
        const countResult = await query(countSql, queryParams.slice(0, -2));
        const total = countResult[0]?.total || 0;

        return res.status(200).json({
            status: 'success',
            data: feedbackResult,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        handleError('support.controller.js', 'getClientFeedback', res, error, error.message);
    }
};

export const getFeedbackById = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id } = req.params;

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        let whereClause = '';
        let queryParams = [];

        if (process.env.SUPER_ADMIN_ID !== client_id) {
            whereClause += ' AND cf.client_id = ? ';
            queryParams.push(client_id);
        }
        const feedbackSql = `SELECT own.first_name, own.last_name, own.email, cf.* FROM client_feedback as cf LEFT JOIN clients own on cf.client_id = own.unique_id WHERE cf.unique_id = ? ${whereClause}`;
        const feedbackResult = await query(feedbackSql, [feedback_id, ...queryParams]);

        if (feedbackResult.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Feedback not found' });
        }

        const feedback = feedbackResult[0];

        const commentsSql = `
            SELECT fc.*, 
                        CASE 
                            WHEN fc.commented_by = 'admin' THEN 'Support Team'
                            ELSE CONCAT(c.first_name, ' ', c.last_name)
                        END as commenter_name
            FROM feedback_comments fc
            LEFT JOIN clients c ON c.unique_id = fc.commented_by_id
            WHERE fc.feedback_id = ? AND fc.is_internal = FALSE
            ORDER BY fc.created_at DESC
        `;
        const comments = await query(commentsSql, [feedback_id]);

        const imagesSql = ` SELECT * FROM client_feedback_images  WHERE feedback_id = ? ORDER BY uploaded_at DESC`;
        const images = await query(imagesSql, [feedback_id]);

        await generateSignedUrls(images);

        return res.status(200).json({ status: 'success', data: { feedback, comments, images } });
    } catch (error) {
        handleError('support.controller.js', 'getFeedbackById', res, error, error.message);
    }
};

export const addFeedbackImages = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id } = req.params;

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        await new Promise((resolve, reject) => {
            upload.array('images', 5)(req, res, (err) => {
                if (err) {
                    console.error("addFeedbackImages - Error uploading images:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading images"
                    });
                }
                resolve();
            });
        });

        const feedback = await verifyFeedbackOwnership(feedback_id, client_id);
        if (!feedback) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback not found'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No images provided'
            });
        }

        const uploadedImages = await processImageUploads(req.files, feedback_id, 'client');

        return res.status(201).json({
            status: 'success',
            message: 'Images added successfully',
            data: {
                uploaded_images: uploadedImages
            }
        });
    } catch (error) {
        handleError('support.controller.js', 'addFeedbackImages', res, error, error.message);
    }
};

export const deleteFeedbackImage = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id, image_id } = req.params;

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        const imageSql = `
            SELECT cfi.image_url, cfi.unique_id
            FROM client_feedback_images cfi
            JOIN client_feedback cf ON cfi.feedback_id = cf.unique_id
            WHERE cfi.unique_id = ? AND cf.unique_id = ? AND cf.client_id = ? AND cfi.uploaded_by = 'client'
        `;
        const imageResult = await query(imageSql, [image_id, feedback_id, client_id]);

        if (imageResult.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Image not found or you do not have permission to delete it'
            });
        }

        const image = imageResult[0];

        try {
            await deleteObjectFromS3(image.image_url);
        } catch (s3Error) {
            console.error("Error deleting from S3:", s3Error);
        }

        const deleteSql = 'DELETE FROM client_feedback_images WHERE unique_id = ?';
        const deleteResult = await query(deleteSql, [image_id]);

        if (deleteResult?.affectedRows > 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Image deleted successfully'
            });
        } else {
            return res.status(400).json({ message: 'Failed to delete image' });
        }
    } catch (error) {
        handleError('support.controller.js', 'deleteFeedbackImage', res, error, error.message);
    }
};

export const addComment = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id } = req.params;
        const { comment, parent_comment_id } = convertEmptyStringsToNull(req.body);
        const isAdmin = process.env.SUPER_ADMIN_ID === client_id

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        if (!comment) {
            return res.status(400).json({ status: 'error', message: 'Comment is required' });
        }

        const feedback = await verifyFeedbackOwnership(feedback_id);
        if (!feedback) {
            return res.status(404).json({ status: 'error', message: 'Feedback not found' });
        }

        if (parent_comment_id) {
            const parentCheck = await query('SELECT id FROM feedback_comments WHERE id = ? AND feedback_id = ? AND is_internal = FALSE', [parent_comment_id, feedback_id]);

            if (parentCheck.length === 0) {
                return res.status(400).json({ status: 'error', message: 'Parent comment not found' });
            }
        }

        const commentId = uuidv4();
        const commented_by = isAdmin ? "admin" : "client"
        const commentSql = `INSERT INTO feedback_comments (unique_id, feedback_id, commented_by, commented_by_id , comment, parent_comment_id)  VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await query(commentSql, [commentId, feedback_id, commented_by, client_id, comment, parent_comment_id]);

        if (result?.affectedRows > 0) {
            return res.status(201).json({ status: 'success', message: 'Comment added successfully', data: { comment_id: commentId } });
        } else {
            return res.status(400).json({ message: 'Failed to add comment' });
        }
    } catch (error) {
        handleError('support.controller.js', 'addComment', res, error, error.message);
    }
};

export const updateComment = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id, comment_id } = req.params;
        const { comment } = convertEmptyStringsToNull(req.body);
        const isAdmin = process.env.SUPER_ADMIN_ID === client_id

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        if (!comment) {
            return res.status(400).json({ status: 'error', message: 'Comment is required' });
        }

        const commented_by = isAdmin ? "admin" : "client"

        const commentCheck = await query(`
            SELECT fc.id 
            FROM feedback_comments fc
            JOIN client_feedback cf ON fc.feedback_id = cf.unique_id
            WHERE fc.unique_id = ? AND fc.feedback_id = ? AND cf.client_id = ? AND fc.commented_by = ? AND fc.commented_by_id = ?
        `, [comment_id, feedback_id, client_id, commented_by, client_id]);

        if (commentCheck.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Comment not found or you do not have permission to update it'
            });
        }

        const updateSql = ` UPDATE feedback_comments  SET comment = ?, updated_at = NOW() WHERE unique_id = ? AND feedback_id = ? AND commented_by_id = ?`;
        const result = await query(updateSql, [comment, comment_id, feedback_id, client_id]);

        if (result?.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Comment updated successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to update comment' });
        }
    } catch (error) {
        handleError('support.controller.js', 'updateComment', res, error, error.message);
    }
};

export const deleteComment = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const { feedback_id, comment_id } = req.params;
        const isAdmin = process.env.SUPER_ADMIN_ID === client_id

        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        const commented_by = isAdmin ? "admin" : "client"
        const commentCheck = await query(` SELECT fc.id FROM feedback_comments fc JOIN client_feedback cf ON fc.feedback_id = cf.unique_id WHERE fc.unique_id = ? AND fc.feedback_id = ? AND cf.client_id = ? AND fc.commented_by = ? AND fc.commented_by_id = ?`, [comment_id, feedback_id, client_id, commented_by, client_id]);

        if (commentCheck.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Comment not found or you do not have permission to delete it' });
        }

        const deleteSql = 'DELETE FROM feedback_comments WHERE unique_id = ? AND feedback_id = ? AMD commented_by_id = ?';
        const result = await query(deleteSql, [comment_id, feedback_id, client_id]);

        if (result?.affectedRows > 0) {
            return res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to delete comment' });
        }
    } catch (error) {
        handleError('support.controller.js', 'deleteComment', res, error, error.message);
    }
};

export const getFeedbackStats = async (req, res) => {
    try {
        const client_id = req.user?.unique_id;
        const isAdmin = process.env.SUPER_ADMIN_ID === client_id
        if (!client_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        const clientCondition = isAdmin ? "" : 'WHERE client_id = ?'
        const value = isAdmin ? [] : [client_id]

        const statsSql = `
            SELECT 
                COUNT(*) as total_feedback,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
                SUM(CASE WHEN type = 'bug' THEN 1 ELSE 0 END) as bug_count,
                SUM(CASE WHEN type = 'complaint' THEN 1 ELSE 0 END) as complaint_count,
                SUM(CASE WHEN type = 'suggestion' THEN 1 ELSE 0 END) as suggestion_count,
                SUM(CASE WHEN type = 'billing' THEN 1 ELSE 0 END) as billing_count,
                SUM(CASE WHEN type = 'feature_request' THEN 1 ELSE 0 END) as feature_request_count,
                AVG(client_satisfaction_rating) as avg_satisfaction_rating,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as last_30_days_count,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as last_7_days_count
            FROM client_feedback ${clientCondition}
        `;
        const statsResult = await query(statsSql, value);

        return res.status(200).json({
            status: 'success',
            data: statsResult[0]
        });
    } catch (error) {
        handleError('support.controller.js', 'getFeedbackStats', res, error, error.message);
    }
};

export const getFeedbackMetadata = async (req, res) => {
    try {
        return res.status(200).json({
            status: 'success',
            data: {
                types: VALID_FEEDBACK_TYPES,
                statuses: VALID_FEEDBACK_STATUSES,
                client_allowed_statuses: CLIENT_ALLOWED_STATUSES
            }
        });
    } catch (error) {
        handleError('support.controller.js', 'getFeedbackMetadata', res, error, error.message);
    }
};

// =================
// ADMIN CONTROLLERS
// =================

export const getAllFeedback = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            type,
            client_id,
            assigned_to_admin_id,
            search,
            date_from,
            date_to,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE 1=1';
        let queryParams = [];

        if (status) {
            whereClause += ' AND cf.status = ?';
            queryParams.push(status);
        }
        if (type) {
            whereClause += ' AND cf.type = ?';
            queryParams.push(type);
        }
        if (client_id) {
            whereClause += ' AND cf.client_id = ?';
            queryParams.push(client_id);
        }
        if (assigned_to_admin_id) {
            whereClause += ' AND cf.assigned_to_admin_id = ?';
            queryParams.push(assigned_to_admin_id);
        }
        if (search) {
            whereClause += ' AND (cf.title LIKE ? OR cf.description LIKE ? OR CONCAT(c.first_name, " ", c.last_name) LIKE ? OR c.cafe_name LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (date_from) {
            whereClause += ' AND cf.created_at >= ?';
            queryParams.push(date_from);
        }
        if (date_to) {
            whereClause += ' AND cf.created_at <= ?';
            queryParams.push(date_to + ' 23:59:59');
        }

        const validSortFields = ['created_at', 'updated_at', 'status', 'type', 'title', 'client_name'];
        const validSortOrders = ['ASC', 'DESC'];
        const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
        const sortDirection = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';

        const feedbackSql = `
            SELECT cf.*, 
                   CONCAT(c.first_name, ' ', c.last_name) as client_name,
                   c.cafe_name,
                   c.email as client_email,
                   c.phone as client_phone,
                   COUNT(DISTINCT fc.id) as comment_count,
                   COUNT(DISTINCT cfi.id) as image_count,
                   a.name as assigned_admin_name
            FROM client_feedback cf
            JOIN clients c ON cf.client_id = c.unique_id
            LEFT JOIN feedback_comments fc ON cf.unique_id = fc.feedback_id
            LEFT JOIN client_feedback_images cfi ON cf.unique_id = cfi.feedback_id
            LEFT JOIN admins a ON cf.assigned_to_admin_id = a.id
            ${whereClause}
            GROUP BY cf.id
            ORDER BY ${sortField === 'client_name' ? 'CONCAT(c.first_name, " ", c.last_name)' : 'cf.' + sortField} ${sortDirection}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(parseInt(limit), parseInt(offset));

        const feedbackResult = await query(feedbackSql, queryParams);

        const countSql = `
            SELECT COUNT(*) as total 
            FROM client_feedback cf
            JOIN clients c ON cf.client_id = c.unique_id
            ${whereClause}
        `;
        const countResult = await query(countSql, queryParams.slice(0, -2));
        const total = countResult[0]?.total || 0;

        return res.status(200).json({
            status: 'success',
            data: feedbackResult,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total: total,
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        handleError('admin.support.controller.js', 'getAllFeedback', res, error, error.message);
    }
};

export const getAdminFeedbackById = async (req, res) => {
    try {
        const { feedback_id } = req.params;

        const feedbackSql = `
            SELECT cf.*, 
                   CONCAT(c.first_name, ' ', c.last_name) as client_name,
                   c.cafe_name,
                   c.email as client_email,
                   c.phone as client_phone,
                   a.name as assigned_admin_name
            FROM client_feedback cf
            JOIN clients c ON cf.client_id = c.unique_id
            LEFT JOIN admins a ON cf.assigned_to_admin_id = a.id
            WHERE cf.unique_id = ?
        `;
        const feedbackResult = await query(feedbackSql, [feedback_id]);

        if (feedbackResult.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback not found'
            });
        }

        const feedback = feedbackResult[0];

        const commentsSql = `
            SELECT fc.*, 
                   CASE 
                       WHEN fc.commented_by = 'admin' THEN COALESCE(a.name, 'Admin')
                       ELSE CONCAT(c.first_name, ' ', c.last_name)
                   END as commenter_name
            FROM feedback_comments fc
            LEFT JOIN admins a ON fc.admin_id = a.id AND fc.commented_by = 'admin'
            LEFT JOIN clients c ON c.unique_id = ? AND fc.commented_by = 'client'
            WHERE fc.feedback_id = ?
            ORDER BY fc.created_at ASC
        `;
        const comments = await query(commentsSql, [feedback.client_id, feedback_id]);

        const imagesSql = `
            SELECT * FROM client_feedback_images 
            WHERE feedback_id = ?
            ORDER BY uploaded_at ASC
        `;
        const images = await query(imagesSql, [feedback_id]);

        await generateSignedUrls(images);

        return res.status(200).json({
            status: 'success',
            data: {
                feedback,
                comments,
                images
            }
        });
    } catch (error) {
        handleError('admin.support.controller.js', 'getAdminFeedbackById', res, error, error.message);
    }
};

export const updateFeedbackStatusAdmin = async (req, res) => {
    try {
        const { feedback_id } = req.params;
        const { status, admin_id } = convertEmptyStringsToNull(req.body);

        if (!status) {
            return res.status(400).json({
                status: 'error',
                message: 'Status is required'
            });
        }

        if (!validateFeedbackStatus(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status. Valid statuses: ' + VALID_FEEDBACK_STATUSES.join(', ')
            });
        }

        const feedback = await checkFeedbackExists(feedback_id);
        if (!feedback) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback not found'
            });
        }

        let updateSql = 'UPDATE client_feedback SET status = ?, assigned_to_admin_id = ?';
        let updateParams = [status, admin_id];

        if (status === 'resolved' || status === 'closed') {
            updateSql += ', resolved_at = NOW()';
        }

        updateSql += ', updated_at = NOW() WHERE unique_id = ?';
        updateParams.push(feedback_id);

        const result = await query(updateSql, updateParams);

        if (result?.affectedRows > 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Feedback status updated successfully'
            });
        } else {
            return res.status(400).json({ message: 'Failed to update feedback status' });
        }
    } catch (error) {
        handleError('admin.support.controller.js', 'updateFeedbackStatusAdmin', res, error, error.message);
    }
};

export const assignFeedbackToAdmin = async (req, res) => {
    try {
        const { feedback_id } = req.params;
        const { admin_id } = convertEmptyStringsToNull(req.body);

        if (!admin_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Admin ID is required'
            });
        }

        const feedback = await checkFeedbackExists(feedback_id);
        if (!feedback) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback not found'
            });
        }

        const updateSql = `
            UPDATE client_feedback 
            SET assigned_to_admin_id = ?, updated_at = NOW()
            WHERE unique_id = ?
        `;
        const result = await query(updateSql, [admin_id, feedback_id]);

        if (result?.affectedRows > 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Feedback assigned successfully'
            });
        } else {
            return res.status(400).json({ message: 'Failed to assign feedback' });
        }
    } catch (error) {
        handleError('admin.support.controller.js', 'assignFeedbackToAdmin', res, error, error.message);
    }
};

export const addAdminComment = async (req, res) => {
    try {
        const { feedback_id } = req.params;
        const { comment, admin_id, is_internal = false, parent_comment_id } = convertEmptyStringsToNull(req.body);

        if (!comment) {
            return res.status(400).json({
                status: 'error',
                message: 'Comment is required'
            });
        }

        if (!admin_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Admin ID is required'
            });
        }

        const feedback = await checkFeedbackExists(feedback_id);
        if (!feedback) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback not found'
            });
        }

        if (parent_comment_id) {
            const parentCheck = await query(
                'SELECT id FROM feedback_comments WHERE id = ? AND feedback_id = ?',
                [parent_comment_id, feedback_id]
            );

            if (parentCheck.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Parent comment not found'
                });
            }
        }

        const commentId = uuidv4();
        const commentSql = `
            INSERT INTO feedback_comments (unique_id, feedback_id, commented_by, admin_id, comment, parent_comment_id, is_internal) 
            VALUES (?, ?, 'admin', ?, ?, ?, ?)
        `;
        const result = await query(commentSql, [commentId, feedback_id, admin_id, comment, parent_comment_id, is_internal]);

        if (result?.affectedRows > 0) {
            return res.status(201).json({
                status: 'success',
                message: 'Comment added successfully',
                data: {
                    comment_id: commentId
                }
            });
        } else {
            return res.status(400).json({ message: 'Failed to add comment' });
        }
    } catch (error) {
        handleError('admin.support.controller.js', 'addAdminComment', res, error, error.message);
    }
};

export const updateAdminComment = async (req, res) => {
    try {
        const { feedback_id, comment_id } = req.params;
        const { comment, admin_id } = convertEmptyStringsToNull(req.body);

        if (!comment) {
            return res.status(400).json({
                status: 'error',
                message: 'Comment is required'
            });
        }

        if (!admin_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Admin ID is required'
            });
        }

        const commentCheck = await query(`
            SELECT fc.id 
            FROM feedback_comments fc
            WHERE fc.unique_id = ? AND fc.feedback_id = ? AND fc.commented_by = 'admin' AND fc.admin_id = ?
        `, [comment_id, feedback_id, admin_id]);

        if (commentCheck.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Comment not found or you do not have permission to update it'
            });
        }

        const updateSql = `
            UPDATE feedback_comments 
            SET comment = ?, updated_at = NOW()
            WHERE unique_id = ? AND feedback_id = ?
        `;
        const result = await query(updateSql, [comment, comment_id, feedback_id]);

        if (result?.affectedRows > 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Comment updated successfully'
            });
        } else {
            return res.status(400).json({ message: 'Failed to update comment' });
        }
    } catch (error) {
        handleError('admin.support.controller.js', 'updateAdminComment', res, error, error.message);
    }
};

export const deleteAdminComment = async (req, res) => {
    try {
        const { feedback_id, comment_id } = req.params;
        const { admin_id } = convertEmptyStringsToNull(req.body);

        if (!admin_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Admin ID is required'
            });
        }

        const commentCheck = await query(`
            SELECT fc.id 
            FROM feedback_comments fc
            WHERE fc.unique_id = ? AND fc.feedback_id = ? AND fc.commented_by = 'admin' AND fc.admin_id = ?
        `, [comment_id, feedback_id, admin_id]);

        if (commentCheck.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Comment not found or you do not have permission to delete it'
            });
        }

        const deleteSql = 'DELETE FROM feedback_comments WHERE unique_id = ? AND feedback_id = ?';
        const result = await query(deleteSql, [comment_id, feedback_id]);

        if (result?.affectedRows > 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Comment deleted successfully'
            });
        } else {
            return res.status(400).json({ message: 'Failed to delete comment' });
        }
    } catch (error) {
        handleError('admin.support.controller.js', 'deleteAdminComment', res, error, error.message);
    }
};

export const addAdminFeedbackImages = async (req, res) => {
    try {
        const { feedback_id } = req.params;

        await new Promise((resolve, reject) => {
            upload.array('images', 5)(req, res, (err) => {
                if (err) {
                    console.error("addAdminFeedbackImages - Error uploading images:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading images"
                    });
                }
                resolve();
            });
        });

        const feedback = await checkFeedbackExists(feedback_id);
        if (!feedback) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback not found'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No images provided'
            });
        }

        const uploadedImages = await processImageUploads(req.files, feedback_id, 'admin');

        return res.status(201).json({
            status: 'success',
            message: 'Images added successfully',
            data: {
                uploaded_images: uploadedImages
            }
        });
    } catch (error) {
        handleError('admin.support.controller.js', 'addAdminFeedbackImages', res, error, error.message);
    }
};

export const getAdminFeedbackStats = async (req, res) => {
    try {
        const { admin_id, date_from, date_to } = req.query;
        let whereClause = 'WHERE 1=1';
        let queryParams = [];

        if (admin_id) {
            whereClause += ' AND assigned_to_admin_id = ?';
            queryParams.push(admin_id);
        }
        if (date_from) {
            whereClause += ' AND created_at >= ?';
            queryParams.push(date_from);
        }
        if (date_to) {
            whereClause += ' AND created_at <= ?';
            queryParams.push(date_to + ' 23:59:59');
        }

        const statsSql = `
            SELECT 
                COUNT(*) as total_feedback,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
                SUM(CASE WHEN type = 'bug' THEN 1 ELSE 0 END) as bug_count,
                SUM(CASE WHEN type = 'complaint' THEN 1 ELSE 0 END) as complaint_count,
                SUM(CASE WHEN type = 'suggestion' THEN 1 ELSE 0 END) as suggestion_count,
                SUM(CASE WHEN type = 'billing' THEN 1 ELSE 0 END) as billing_count,
                SUM(CASE WHEN type = 'feature_request' THEN 1 ELSE 0 END) as feature_request_count,
                AVG(client_satisfaction_rating) as avg_satisfaction_rating,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as last_30_days_count,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as last_7_days_count,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 1 END) as last_24_hours_count,
                COUNT(CASE WHEN assigned_to_admin_id IS NOT NULL THEN 1 END) as assigned_count,
                COUNT(CASE WHEN assigned_to_admin_id IS NULL THEN 1 END) as unassigned_count,
                AVG(CASE WHEN resolved_at IS NOT NULL THEN 
                    TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
                END) as avg_resolution_time_hours
            FROM client_feedback 
            ${whereClause}
        `;
        const statsResult = await query(statsSql, queryParams);

        const typeStatsSql = `
            SELECT type, COUNT(*) as count
            FROM client_feedback
            ${whereClause}
            GROUP BY type
            ORDER BY count DESC
        `;
        const typeStats = await query(typeStatsSql, queryParams);

        return res.status(200).json({
            status: 'success',
            data: {
                overview: statsResult[0],
                type_breakdown: typeStats
            }
        });
    } catch (error) {
        handleError('admin.support.controller.js', 'getAdminFeedbackStats', res, error, error.message);
    }
};