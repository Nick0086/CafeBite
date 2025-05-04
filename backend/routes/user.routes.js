import express from 'express';
import { getClinetDataById, registerClient } from '../controller/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerClient);
router.get('/', authMiddleware, getClinetDataById);
export default router;