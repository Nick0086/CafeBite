import express from 'express';
import templateController from '../controller/templates.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { subscriptionMiddleware } from '../middlewares/subcription.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, subscriptionMiddleware, templateController.getAllTemplatesList);
router.get('/:templateId', authMiddleware, subscriptionMiddleware, templateController.getTemplateDataById);
router.post('/', authMiddleware, subscriptionMiddleware, templateController.createTemplate);
router.put('/:templateId', authMiddleware, subscriptionMiddleware, templateController.updateTemplate);

export default router;