import { Router } from "express";
import * as subscriptionController from "./subscription.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { verifyPaymentValidator, getSubscriptionHistoryValidator } from "./subscription.validator.js";

const router = Router();

router.get("/verify-payment/:razorpay_payment_id", authMiddleware, verifyPaymentValidator, validate, subscriptionController.validateSubscriptionPayment);
router.get("/status", authMiddleware, subscriptionController.fetchSubscriptionStatus);
router.get("/history", authMiddleware, getSubscriptionHistoryValidator, validate, subscriptionController.fetchSubscriptionHistory);

export default router;
