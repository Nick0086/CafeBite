/*
    Database Schema
    ===============
    CREATE TABLE client_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id CHAR(36) NOT NULL UNIQUE,
        client_id CHAR(36) NOT NULL,
        type ENUM('complaint', 'bug', 'suggestion', 'billing', 'feature_request') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        status ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled') DEFAULT 'open',
        client_satisfaction_rating INT,
        resolved_at TIMESTAMP NULL,
        assigned_to_admin_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
    );

    CREATE TABLE feedback_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id CHAR(36) NOT NULL UNIQUE,
        feedback_id CHAR(36) NOT NULL,
        commented_by ENUM('client', 'admin') NOT NULL,
        commented_by_id CHAR(36),
        admin_id INT NULL,
        comment TEXT NOT NULL,
        parent_comment_id CHAR(36) NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE
    );

    CREATE TABLE client_feedback_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id CHAR(36) NOT NULL UNIQUE,
        feedback_id CHAR(36) NOT NULL,
        image_url TEXT NOT NULL,
        original_filename VARCHAR(255),
        file_size_bytes INT,
        file_type VARCHAR(50),
        uploaded_by ENUM('client', 'admin') DEFAULT 'client',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE
    );
*/

import query from "../../utils/query.utils.js";

// ===== FEEDBACK QUERIES =====

export const findFeedbackById = async (feedbackId, clientId = null, connection = null) => {
    let sql = 'SELECT id, status, type, title, description, client_id FROM client_feedback WHERE unique_id = ?';
    const params = [feedbackId];
    if (clientId) {
        sql += ' AND client_id = ?';
        params.push(clientId);
    }
    const result = await query(sql, params, connection);
    return result.length > 0 ? result[0] : null;
};

export const findFeedbackExists = async (feedbackId, connection = null) => {
    const sql = 'SELECT id, client_id, status FROM client_feedback WHERE unique_id = ?';
    const result = await query(sql, [feedbackId], connection);
    return result.length > 0 ? result[0] : null;
};

export const createFeedback = async (feedbackId, clientId, type, title, description, connection = null) => {
    const sql = 'INSERT INTO client_feedback (unique_id, client_id, type, title, description) VALUES (?, ?, ?, ?, ?)';
    return await query(sql, [feedbackId, clientId, type, title, description], connection);
};

export const updateFeedbackById = async (feedbackId, clientId, updateFields, updateParams, connection = null) => {
    const sql = `UPDATE client_feedback SET ${updateFields.join(', ')}, updated_at = NOW() WHERE unique_id = ? AND client_id = ?`;
    return await query(sql, [...updateParams, feedbackId, clientId], connection);
};

export const updateFeedbackTypeById = async (feedbackId, type, connection = null) => {
    const sql = 'UPDATE client_feedback SET type = ?, updated_at = NOW() WHERE unique_id = ?';
    return await query(sql, [type, feedbackId], connection);
};

export const updateFeedbackStatusById = async (feedbackId, status, additionalFields = [], additionalParams = [], connection = null) => {
    let sql = 'UPDATE client_feedback SET status = ?';
    const params = [status];
    if (additionalFields.length > 0) {
        sql += `, ${additionalFields.join(', ')}`;
        params.push(...additionalParams);
    }
    sql += ', updated_at = NOW() WHERE unique_id = ?';
    params.push(feedbackId);
    return await query(sql, params, connection);
};

export const findClientFeedback = async (clientId, isAdmin, whereClause, queryParams, limit, offset, connection = null) => {
    const sql = `
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
    return await query(sql, [...queryParams, limit, offset], connection);
};

export const countClientFeedback = async (clientId, isAdmin, whereClause, queryParams, connection = null) => {
    const sql = `SELECT COUNT(*) as total FROM client_feedback cf ${whereClause}`;
    return await query(sql, queryParams, connection);
};

export const findFeedbackDetailById = async (feedbackId, clientId, isAdmin, connection = null) => {
    let whereClause = '';
    const params = [feedbackId];
    if (!isAdmin) {
        whereClause = ' AND cf.client_id = ?';
        params.push(clientId);
    }
    const sql = `SELECT own.first_name, own.last_name, own.email, cf.* FROM client_feedback as cf LEFT JOIN clients own on cf.client_id = own.unique_id WHERE cf.unique_id = ? ${whereClause}`;
    return await query(sql, params, connection);
};

export const findFeedbackComments = async (feedbackId, connection = null) => {
    const sql = `
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
    return await query(sql, [feedbackId], connection);
};

export const findFeedbackImages = async (feedbackId, connection = null) => {
    const sql = 'SELECT * FROM client_feedback_images WHERE feedback_id = ? ORDER BY uploaded_at DESC';
    return await query(sql, [feedbackId], connection);
};

export const findImageById = async (imageId, feedbackId, clientId, connection = null) => {
    const sql = `
        SELECT cfi.image_url, cfi.unique_id
        FROM client_feedback_images cfi
        JOIN client_feedback cf ON cfi.feedback_id = cf.unique_id
        WHERE cfi.unique_id = ? AND cf.unique_id = ? AND cf.client_id = ? AND cfi.uploaded_by = 'client'
    `;
    return await query(sql, [imageId, feedbackId, clientId], connection);
};

export const deleteImageById = async (imageId, connection = null) => {
    const sql = 'DELETE FROM client_feedback_images WHERE unique_id = ?';
    return await query(sql, [imageId], connection);
};

export const createComment = async (commentId, feedbackId, commentedBy, commentedById, comment, parentCommentId, connection = null) => {
    const sql = 'INSERT INTO feedback_comments (unique_id, feedback_id, commented_by, commented_by_id, comment, parent_comment_id) VALUES (?, ?, ?, ?, ?, ?)';
    return await query(sql, [commentId, feedbackId, commentedBy, commentedById, comment, parentCommentId], connection);
};

export const findParentComment = async (parentCommentId, feedbackId, connection = null) => {
    const sql = 'SELECT id FROM feedback_comments WHERE id = ? AND feedback_id = ? AND is_internal = FALSE';
    return await query(sql, [parentCommentId, feedbackId], connection);
};

export const findCommentForUpdate = async (commentId, feedbackId, clientId, commentedBy, connection = null) => {
    const sql = `
        SELECT fc.id 
        FROM feedback_comments fc
        JOIN client_feedback cf ON fc.feedback_id = cf.unique_id
        WHERE fc.unique_id = ? AND fc.feedback_id = ? AND cf.client_id = ? AND fc.commented_by = ? AND fc.commented_by_id = ?
    `;
    return await query(sql, [commentId, feedbackId, clientId, commentedBy, clientId], connection);
};

export const updateCommentById = async (commentId, feedbackId, clientId, comment, connection = null) => {
    const sql = 'UPDATE feedback_comments SET comment = ?, updated_at = NOW() WHERE unique_id = ? AND feedback_id = ? AND commented_by_id = ?';
    return await query(sql, [comment, commentId, feedbackId, clientId], connection);
};

export const deleteCommentById = async (commentId, feedbackId, clientId, connection = null) => {
    const sql = 'DELETE FROM feedback_comments WHERE unique_id = ? AND feedback_id = ? AND commented_by_id = ?';
    return await query(sql, [commentId, feedbackId, clientId], connection);
};

export const findFeedbackStats = async (clientId, isAdmin, connection = null) => {
    const clientCondition = isAdmin ? "" : 'WHERE client_id = ?';
    const value = isAdmin ? [] : [clientId];
    const sql = `
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
    return await query(sql, value, connection);
};

// ===== ADMIN QUERIES =====

export const findAllFeedback = async (whereClause, queryParams, limit, offset, sortField, sortDirection, connection = null) => {
    const orderBy = sortField === 'client_name' ? 'CONCAT(c.first_name, " ", c.last_name)' : 'cf.' + sortField;
    const sql = `
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
        ORDER BY ${orderBy} ${sortDirection}
        LIMIT ? OFFSET ?
    `;
    return await query(sql, [...queryParams, limit, offset], connection);
};

export const countAllFeedback = async (whereClause, queryParams, connection = null) => {
    const sql = `
        SELECT COUNT(*) as total 
        FROM client_feedback cf
        JOIN clients c ON cf.client_id = c.unique_id
        ${whereClause}
    `;
    return await query(sql, queryParams, connection);
};

export const findAdminFeedbackById = async (feedbackId, connection = null) => {
    const sql = `
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
    return await query(sql, [feedbackId], connection);
};

export const findAdminFeedbackComments = async (feedbackId, clientId, connection = null) => {
    const sql = `
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
    return await query(sql, [clientId, feedbackId], connection);
};

export const findAdminFeedbackImages = async (feedbackId, connection = null) => {
    const sql = 'SELECT * FROM client_feedback_images WHERE feedback_id = ? ORDER BY uploaded_at ASC';
    return await query(sql, [feedbackId], connection);
};

export const updateAdminFeedbackStatus = async (feedbackId, status, adminId, additionalFields = [], additionalParams = [], connection = null) => {
    let sql = 'UPDATE client_feedback SET status = ?, assigned_to_admin_id = ?';
    const params = [status, adminId];
    if (additionalFields.length > 0) {
        sql += `, ${additionalFields.join(', ')}`;
        params.push(...additionalParams);
    }
    sql += ', updated_at = NOW() WHERE unique_id = ?';
    params.push(feedbackId);
    return await query(sql, params, connection);
};

export const updateFeedbackAssignment = async (feedbackId, adminId, connection = null) => {
    const sql = 'UPDATE client_feedback SET assigned_to_admin_id = ?, updated_at = NOW() WHERE unique_id = ?';
    return await query(sql, [adminId, feedbackId], connection);
};

export const createAdminComment = async (commentId, feedbackId, adminId, comment, parentCommentId, isInternal, connection = null) => {
    const sql = 'INSERT INTO feedback_comments (unique_id, feedback_id, commented_by, admin_id, comment, parent_comment_id, is_internal) VALUES (?, ?, \'admin\', ?, ?, ?, ?)';
    return await query(sql, [commentId, feedbackId, adminId, comment, parentCommentId, isInternal], connection);
};

export const findAdminParentComment = async (parentCommentId, feedbackId, connection = null) => {
    const sql = 'SELECT id FROM feedback_comments WHERE id = ? AND feedback_id = ?';
    return await query(sql, [parentCommentId, feedbackId], connection);
};

export const findAdminCommentForUpdate = async (commentId, feedbackId, adminId, connection = null) => {
    const sql = `
        SELECT fc.id 
        FROM feedback_comments fc
        WHERE fc.unique_id = ? AND fc.feedback_id = ? AND fc.commented_by = 'admin' AND fc.admin_id = ?
    `;
    return await query(sql, [commentId, feedbackId, adminId], connection);
};

export const updateAdminCommentById = async (commentId, feedbackId, comment, connection = null) => {
    const sql = 'UPDATE feedback_comments SET comment = ?, updated_at = NOW() WHERE unique_id = ? AND feedback_id = ?';
    return await query(sql, [comment, commentId, feedbackId], connection);
};

export const deleteAdminCommentById = async (commentId, feedbackId, connection = null) => {
    const sql = 'DELETE FROM feedback_comments WHERE unique_id = ? AND feedback_id = ?';
    return await query(sql, [commentId, feedbackId], connection);
};

export const createFeedbackImage = async (imageId, feedbackId, imageUrl, originalFilename, fileSize, fileType, uploadedBy, connection = null) => {
    const sql = 'INSERT INTO client_feedback_images (unique_id, feedback_id, image_url, original_filename, file_size_bytes, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
    return await query(sql, [imageId, feedbackId, imageUrl, originalFilename, fileSize, fileType, uploadedBy], connection);
};

export const findAdminFeedbackStats = async (whereClause, queryParams, connection = null) => {
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
    const statsResult = await query(statsSql, queryParams, connection);

    const typeStatsSql = `
        SELECT type, COUNT(*) as count
        FROM client_feedback
        ${whereClause}
        GROUP BY type
        ORDER BY count DESC
    `;
    const typeStats = await query(typeStatsSql, queryParams, connection);

    return { overview: statsResult[0], type_breakdown: typeStats };
};
