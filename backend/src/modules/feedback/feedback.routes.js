import { Router } from "express";
import * as feedbackController from "./feedback.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
    createFeedbackValidator,
    updateFeedbackValidator,
    updateFeedbackTypeValidator,
    updateFeedbackStatusValidator,
    addCommentValidator,
    updateCommentValidator,
    deleteCommentValidator,
    deleteFeedbackImageValidator,
    updateFeedbackStatusAdminValidator,
    assignFeedbackToAdminValidator,
    addAdminCommentValidator,
    updateAdminCommentValidator,
    deleteAdminCommentValidator,
    getClientFeedbackValidator,
    getAllFeedbackValidator,
    getAdminFeedbackStatsValidator,
    addFeedbackImagesValidator,
    addAdminFeedbackImagesValidator
} from "./feedback.validator.js";

const router = Router();

// ===== ADMIN ROUTES (Must come FIRST to avoid conflicts) =====
router.get('/admin', authMiddleware, feedbackController.fetchAllFeedback);
router.get('/admin/stats', authMiddleware, getAdminFeedbackStatsValidator, validate, feedbackController.fetchAdminFeedbackStats);
router.get('/admin/:feedback_id', authMiddleware, feedbackController.fetchAdminFeedbackById);
router.put('/admin/:feedback_id/status', authMiddleware, updateFeedbackStatusAdminValidator, validate, feedbackController.updateFeedbackStatusAdmin);
router.put('/admin/:feedback_id/assign', authMiddleware, assignFeedbackToAdminValidator, validate, feedbackController.updateFeedbackAssignment);
router.post('/admin/:feedback_id/comments', authMiddleware, addAdminCommentValidator, validate, feedbackController.createAdminComment);
router.put('/admin/:feedback_id/comments/:comment_id', authMiddleware, updateAdminCommentValidator, validate, feedbackController.updateAdminComment);
router.delete('/admin/:feedback_id/comments/:comment_id', authMiddleware, deleteAdminCommentValidator, validate, feedbackController.deleteAdminComment);
router.post('/admin/:feedback_id/images', authMiddleware, addAdminFeedbackImagesValidator, validate, feedbackController.createAdminFeedbackImages);

// ===== CLIENT ROUTES =====
// Static routes first
router.post('/', authMiddleware, createFeedbackValidator, validate, feedbackController.createFeedback);
router.get('/', authMiddleware, getClientFeedbackValidator, validate, feedbackController.fetchClientFeedback);
router.get('/stats', authMiddleware, feedbackController.fetchFeedbackStats);
router.get('/metadata', authMiddleware, feedbackController.fetchFeedbackMetadata);

// Dynamic routes last
router.get('/:feedback_id', authMiddleware, feedbackController.fetchFeedbackById);
router.put('/:feedback_id', authMiddleware, updateFeedbackValidator, validate, feedbackController.updateFeedback);
router.put('/:feedback_id/type', authMiddleware, updateFeedbackTypeValidator, validate, feedbackController.updateFeedbackType);
router.put('/:feedback_id/status', authMiddleware, updateFeedbackStatusValidator, validate, feedbackController.updateFeedbackStatus);
router.post('/:feedback_id/images', authMiddleware, addFeedbackImagesValidator, validate, feedbackController.createFeedbackImages);
router.delete('/:feedback_id/images/:image_id', authMiddleware, deleteFeedbackImageValidator, validate, feedbackController.deleteFeedbackImage);

// Comment routes
router.post('/:feedback_id/comments', authMiddleware, addCommentValidator, validate, feedbackController.createComment);
router.put('/:feedback_id/comments/:comment_id', authMiddleware, updateCommentValidator, validate, feedbackController.updateComment);
router.delete('/:feedback_id/comments/:comment_id', authMiddleware, deleteCommentValidator, validate, feedbackController.deleteComment);

export default router;
