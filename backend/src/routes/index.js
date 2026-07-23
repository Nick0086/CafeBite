import { Router } from 'express';
import clientRoutes from '../modules/client/client.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import commonRoutes from '../modules/common/common.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import menuItemRoutes from '../modules/menu-item/menu-item.routes.js';
import templateRoutes from '../modules/template/template.routes.js';
import tableRoutes from '../modules/table/table.routes.js';
import customerMenuRoutes from '../modules/customer-menu/customer-menu.routes.js';
import feedbackRoutes from '../modules/feedback/feedback.routes.js';
import subscriptionRoutes from '../modules/subscription/subscription.routes.js';

const router = Router();

router.use('/client', clientRoutes);
router.use('/auth', authRoutes);
router.use('/common', commonRoutes);
router.use('/category', categoryRoutes);
router.use('/menu', menuItemRoutes);
router.use('/template', templateRoutes);
router.use('/tables', tableRoutes);
router.use('/customer-menu', customerMenuRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/subscription', subscriptionRoutes);

export default router;
