import { param, query } from "express-validator";

export const verifyPaymentValidator = [
    param("razorpay_payment_id")
        .notEmpty().withMessage("Razorpay payment ID is required")
        .trim()
];

export const getSubscriptionHistoryValidator = [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100")
];
