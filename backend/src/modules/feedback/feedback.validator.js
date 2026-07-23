import { body, param, query } from "express-validator";

export const createFeedbackValidator = [
    body("type")
        .notEmpty().withMessage("Type is required")
        .isIn(['complaint', 'bug', 'suggestion', 'billing', 'feature_request'])
        .withMessage("Invalid feedback type"),
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
    body("description")
        .notEmpty().withMessage("Description is required")
        .trim()
];

export const updateFeedbackValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    body("type")
        .optional()
        .isIn(['complaint', 'bug', 'suggestion', 'billing', 'feature_request'])
        .withMessage("Invalid feedback type"),
    body("title")
        .optional()
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
    body("description")
        .optional()
        .trim()
];

export const updateFeedbackTypeValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    body("type")
        .notEmpty().withMessage("Type is required")
        .isIn(['complaint', 'bug', 'suggestion', 'billing', 'feature_request'])
        .withMessage("Invalid feedback type")
];

export const updateFeedbackStatusValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    body("status")
        .notEmpty().withMessage("Status is required")
        .isIn(['open', 'in_progress', 'resolved', 'closed', 'cancelled'])
        .withMessage("Invalid status"),
    body("satisfaction_rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5")
];

export const addCommentValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    body("comment")
        .notEmpty().withMessage("Comment is required")
        .trim(),
    body("parent_comment_id")
        .optional()
        .trim()
];

export const updateCommentValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    param("comment_id")
        .notEmpty().withMessage("Comment ID is required")
        .trim(),
    body("comment")
        .notEmpty().withMessage("Comment is required")
        .trim()
];

export const deleteCommentValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    param("comment_id")
        .notEmpty().withMessage("Comment ID is required")
        .trim()
];

export const deleteFeedbackImageValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    param("image_id")
        .notEmpty().withMessage("Image ID is required")
        .trim()
];

export const updateFeedbackStatusAdminValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    body("status")
        .notEmpty().withMessage("Status is required")
        .isIn(['open', 'in_progress', 'resolved', 'closed', 'cancelled'])
        .withMessage("Invalid status"),
    body("admin_id")
        .optional()
        .trim()
];

export const assignFeedbackToAdminValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    body("admin_id")
        .notEmpty().withMessage("Admin ID is required")
        .trim()
];

export const addAdminCommentValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    body("comment")
        .notEmpty().withMessage("Comment is required")
        .trim(),
    body("admin_id")
        .notEmpty().withMessage("Admin ID is required")
        .trim(),
    body("is_internal")
        .optional()
        .isBoolean()
        .withMessage("is_internal must be boolean"),
    body("parent_comment_id")
        .optional()
        .trim()
];

export const updateAdminCommentValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    param("comment_id")
        .notEmpty().withMessage("Comment ID is required")
        .trim(),
    body("comment")
        .notEmpty().withMessage("Comment is required")
        .trim(),
    body("admin_id")
        .notEmpty().withMessage("Admin ID is required")
        .trim()
];

export const deleteAdminCommentValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim(),
    param("comment_id")
        .notEmpty().withMessage("Comment ID is required")
        .trim(),
    body("admin_id")
        .notEmpty().withMessage("Admin ID is required")
        .trim()
];

export const getClientFeedbackValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be >= 1"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be 1-100"),
    query("status")
        .optional()
        .trim(),
    query("type")
        .optional()
        .trim(),
    query("search")
        .optional()
        .trim()
];

export const getAllFeedbackValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be >= 1"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be 1-100"),
    query("status")
        .optional()
        .trim(),
    query("type")
        .optional()
        .trim(),
    query("client_id")
        .optional()
        .trim(),
    query("assigned_to_admin_id")
        .optional()
        .trim(),
    query("search")
        .optional()
        .trim(),
    query("date_from")
        .optional()
        .trim(),
    query("date_to")
        .optional()
        .trim(),
    query("sort_by")
        .optional()
        .trim(),
    query("sort_order")
        .optional()
        .trim()
];

export const getAdminFeedbackStatsValidator = [
    query("admin_id")
        .optional()
        .trim(),
    query("date_from")
        .optional()
        .trim(),
    query("date_to")
        .optional()
        .trim()
];

export const addFeedbackImagesValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim()
];

export const addAdminFeedbackImagesValidator = [
    param("feedback_id")
        .notEmpty().withMessage("Feedback ID is required")
        .trim()
];
