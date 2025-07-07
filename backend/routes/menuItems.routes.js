import express from 'express';
import menuItemsController from '../controller/menuItems.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { subscriptionMiddleware } from '../middlewares/subcription.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, subscriptionMiddleware, menuItemsController.getAllMenuItems);
router.post('/', authMiddleware, subscriptionMiddleware, menuItemsController.addMenuItem);
router.put('/:menuItemId', authMiddleware, subscriptionMiddleware, menuItemsController.updateMenuItem);

export default router;