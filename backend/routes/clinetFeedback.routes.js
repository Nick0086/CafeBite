import express from 'express';
import * as supportController from '../controller/clinetFeedback.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ========== ADMIN ROUTES (Must come FIRST to avoid conflicts) ==========
// Admin routes should be placed before client routes to prevent /:feedback_id from catching /admin
router.get('/admin', authMiddleware, supportController.getAllFeedback);
router.get('/admin/stats', authMiddleware, supportController.getAdminFeedbackStats);
router.get('/admin/:feedback_id', authMiddleware, supportController.getAdminFeedbackById);
router.put('/admin/:feedback_id/status', authMiddleware, supportController.updateFeedbackStatusAdmin);
router.put('/admin/:feedback_id/assign', authMiddleware, supportController.assignFeedbackToAdmin);
router.post('/admin/:feedback_id/comments', authMiddleware, supportController.addAdminComment);
router.put('/admin/:feedback_id/comments/:comment_id', authMiddleware, supportController.updateAdminComment);
router.delete('/admin/:feedback_id/comments/:comment_id', authMiddleware, supportController.deleteAdminComment);
router.post('/admin/:feedback_id/images', authMiddleware, supportController.addAdminFeedbackImages);

// ========== CLIENT ROUTES ==========
// Static routes first (these don't have dynamic parameters)
router.post('/', authMiddleware, supportController.createFeedback);
router.get('/', authMiddleware, supportController.getClientFeedback);
router.get('/stats', authMiddleware, supportController.getFeedbackStats);
router.get('/metadata', authMiddleware, supportController.getFeedbackMetadata);

// Dynamic routes last (these have parameters like :feedback_id)
router.get('/:feedback_id', authMiddleware, supportController.getFeedbackById);
router.put('/:feedback_id', authMiddleware, supportController.updateFeedback);
router.put('/:feedback_id/type', authMiddleware, supportController.updateFeedbackType);
router.put('/:feedback_id/status', authMiddleware, supportController.updateFeedbackStatus);
router.post('/:feedback_id/images', authMiddleware, supportController.addFeedbackImages);
router.delete('/:feedback_id/images/:image_id', authMiddleware, supportController.deleteFeedbackImage);

// Comment routes for specific feedback
router.post('/:feedback_id/comments', authMiddleware, supportController.addComment);
router.put('/:feedback_id/comments/:comment_id', authMiddleware, supportController.updateComment);
router.delete('/:feedback_id/comments/:comment_id', authMiddleware, supportController.deleteComment);

export default router;