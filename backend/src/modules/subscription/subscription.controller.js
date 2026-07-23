import * as subscriptionService from "./subscription.service.js";
import { handleError } from "../../utils/errorHelper.js";

export const validateSubscriptionPayment = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        const { razorpay_payment_id: razorpayPaymentId } = req.params;
        const response = await subscriptionService.validateAndProcessPayment(clientId, razorpayPaymentId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('subscription.controller.js', 'validateSubscriptionPayment', res, error, 'An unexpected error occurred while verifying the subscription.');
    }
};

export const fetchSubscriptionStatus = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        const response = await subscriptionService.fetchSubscriptionStatus(clientId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('subscription.controller.js', 'fetchSubscriptionStatus', res, error, 'An unexpected error occurred while fetching subscription status.');
    }
};

export const fetchSubscriptionHistory = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        const { page = 1, limit = 10 } = req.query;
        const response = await subscriptionService.fetchSubscriptionHistory(clientId, page, limit);
        return res.status(200).json(response);
    } catch (error) {
        handleError('subscription.controller.js', 'fetchSubscriptionHistory', res, error, 'An unexpected error occurred while fetching subscription history.');
    }
};
