import * as subscriptionService from "./subscription.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const validateSubscriptionPayment = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    const { razorpay_payment_id: razorpayPaymentId } = req.params;
    const response = await subscriptionService.validateAndProcessPayment(clientId, razorpayPaymentId);
    return res.status(200).json(response);
});

export const fetchSubscriptionStatus = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    const response = await subscriptionService.fetchSubscriptionStatus(clientId);
    return res.status(200).json(response);
});

export const fetchSubscriptionHistory = asyncHandler(async (req, res) => {
    const clientId = req.user?.unique_id;
    const { page = 1, limit = 10 } = req.query;
    const response = await subscriptionService.fetchSubscriptionHistory(clientId, page, limit);
    return res.status(200).json(response);
});
