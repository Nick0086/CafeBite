import express from 'express';
import { addCategory, getAllCategory, updateCategory } from '../controller/categories.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { subscriptionMiddleware } from '../middlewares/subcription.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, subscriptionMiddleware, getAllCategory);
router.post('/', authMiddleware, subscriptionMiddleware, addCategory);
router.put('/:categoryId', authMiddleware, subscriptionMiddleware, updateCategory);

export default router;