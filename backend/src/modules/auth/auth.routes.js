import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
    checkUserExistsValidator,
    verifyUserPasswordValidator,
    sendOneTimePasswordValidator,
    verifyOneTimePasswordValidator,
    requestPasswordResetValidator,
    performPasswordResetValidator,
    validatePasswordResetTokenValidator
} from "./auth.validator.js";

const router = Router();

router.post('/user/check', checkUserExistsValidator, validate, authController.checkUserExists);
router.post('/user/verify-password', verifyUserPasswordValidator, validate, authController.checkUserPassword);
router.post('/user/send-otp', sendOneTimePasswordValidator, validate, authController.sendOtp);
router.post('/user/verify-otp', verifyOneTimePasswordValidator, validate, authController.validateOtp);

router.get('/password/forgot/:email', requestPasswordResetValidator, validate, authController.initiatePasswordReset);
router.post('/password/reset', performPasswordResetValidator, validate, authController.processPasswordReset);
router.get('/password/check-reset-token/:token', validatePasswordResetTokenValidator, validate, authController.checkPasswordResetToken);

router.get('/session/active', authMiddleware, authController.fetchActiveSession);
router.get('/session/logout', authMiddleware, authController.logout);

export default router;
