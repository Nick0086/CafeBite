import express from 'express';
import menuItemsController from '../controller/menuItems.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/',authMiddleware, menuItemsController.getAllMenuItems);
router.post('/',authMiddleware, menuItemsController.addMenuItem);
router.put('/:menuItemId',authMiddleware,  menuItemsController.updateMenuItem);

export default router;