import express from 'express';
import { getClinetDataById, registerClient, updateClientProfile } from '../controller/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerClient);
router.get('/', authMiddleware, getClinetDataById);
router.put('/update-client-profile', authMiddleware, updateClientProfile);
export default router;