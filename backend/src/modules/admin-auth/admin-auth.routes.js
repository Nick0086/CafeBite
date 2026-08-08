import { Router } from 'express';
import validate from '../../middleware/validate.middleware.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { verifyTotpValidator } from './admin-auth.validator.js';
import * as controller from './admin-auth.controller.js';

const router = Router();

// Public: TOTP PIN Verification
router.post('/verify-totp', verifyTotpValidator, validate, controller.verifyTotp);

// Protected Admin Auth Routes
router.get('/session', adminAuthMiddleware, controller.getSession);
router.post('/logout', adminAuthMiddleware, controller.logout);

export default router;
