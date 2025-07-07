import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import tablesQrcodeController from '../controller/tables-qrcode.controller.js';
import { subscriptionMiddleware } from '../middlewares/subcription.middleware.js';

const router = express.Router();

// Route to create one or multiple tables
router.post('/', authMiddleware, subscriptionMiddleware, tablesQrcodeController.createTables);

// Route to update an existing table by its unique ID
router.put('/:tableId', authMiddleware, subscriptionMiddleware, tablesQrcodeController.updateTable);

// Route to get all tables for the authMiddlewared user
router.get('/', authMiddleware, subscriptionMiddleware, tablesQrcodeController.getAllTables);

// Route to get a single table by its unique ID
router.get('/:tableId', authMiddleware, subscriptionMiddleware, tablesQrcodeController.getTableById);

export default router;
