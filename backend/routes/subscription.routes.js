import express from 'express';
import * as subscriptionController from '../controller/subscription.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/verify-payment-with-razorpay/:razorpay_payment_id',authMiddleware, subscriptionController.verifySubscriptionPayment);

export default router;