import express from 'express';
import templateController from '../controller/templates.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, templateController.getAllTemplatesList);   
router.get('/:templateId', authMiddleware, templateController.getTemplateDataById);
router.post('/', authMiddleware, templateController.createTemplate);
router.put('/:templateId', authMiddleware, templateController.updateTemplate);

export default router;