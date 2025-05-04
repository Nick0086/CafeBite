import express from 'express';
import { addCategory, getAllCategory, updateCategory } from '../controller/categories.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/',authMiddleware, getAllCategory);
router.post('/',authMiddleware, addCategory);
router.put('/:categoryId',authMiddleware,  updateCategory);

export default router;