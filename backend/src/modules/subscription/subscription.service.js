import * as subscriptionRepository from "./subscription.repository.js";
import { getPaymentsById } from "../../providers/razorpay/razorpay.provider.js";
import { HttpError } from "../../utils/errorHelper.js";

export const validateAndProcessPayment = async (clientId, razorpayPaymentId) => {
    if (!razorpayPaymentId) {
        throw new HttpError("Missing Razorpay payment ID.", 400);
    }

    const payment = await getPaymentsById(razorpayPaymentId);

    if (payment.status === 'captured' || payment.status === 'authorized') {
        await processSubscriptionPayment(clientId, payment);
        return {
            status: "success",
            message: "Payment captured successfully and subscription updated.",
            paymentDetails: payment
        };
    } else {
        await logFailedPayment(clientId, payment);
        throw new HttpError(`Payment not successful. Status: ${payment.status}`, 400, 'PAYMENT_FAILED');
    }
};

const processSubscriptionPayment = async (clientId, payment) => {
    const currentSubscription = await subscriptionRepository.findSubscriptionByClientId(clientId);
    const today = new Date();
    let newStartDate, newEndDate;

    if (currentSubscription.length > 0) {
        const subscription = currentSubscription[0];
        const currentEndDate = new Date(subscription.end_date);

        if (currentEndDate > today) {
            const remainingDays = Math.ceil((currentEndDate - today) / (1000 * 60 * 60 * 24));
            newStartDate = today;
            newEndDate = new Date(today);
            newEndDate.setDate(newEndDate.getDate() + 30 + remainingDays + 1);
        } else {
            newStartDate = today;
            newEndDate = new Date(today);
            newEndDate.setDate(newEndDate.getDate() + 30 + 1);
        }

        const updateResult = await subscriptionRepository.updateSubscription(
            clientId,
            payment.id,
            payment.amount / 100,
            payment.currency || 'INR',
            newStartDate.toISOString().split('T')[0],
            newEndDate.toISOString().split('T')[0]
        );
        if (updateResult?.affectedRows === 0) {
            throw new HttpError("Failed to update subscription", 500, 'SUBSCRIPTION_UPDATE_FAILED');
        }
    } else {
        newStartDate = today;
        newEndDate = new Date(today);
        newEndDate.setDate(newEndDate.getDate() + 30 + 1);

        const createResult = await subscriptionRepository.createSubscription(
            clientId,
            payment.id,
            payment.amount / 100,
            payment.currency || 'INR',
            newStartDate.toISOString().split('T')[0],
            newEndDate.toISOString().split('T')[0]
        );
        if (createResult?.affectedRows === 0) {
            throw new HttpError("Failed to create subscription", 500, 'SUBSCRIPTION_CREATE_FAILED');
        }
    }

    const historyResult = await subscriptionRepository.createSubscriptionHistory(
        clientId,
        payment.id,
        payment.invoice_id || null,
        payment.amount / 100,
        payment.currency || 'INR',
        'paid',
        `Payment successful. Subscription period: ${newStartDate.toISOString().split('T')[0]} to ${newEndDate.toISOString().split('T')[0]}`
    );
    if (historyResult?.affectedRows === 0) {
        throw new HttpError("Failed to record payment history", 500, 'HISTORY_CREATE_FAILED');
    }
};

const logFailedPayment = async (clientId, payment) => {
    const historyResult = await subscriptionRepository.createSubscriptionHistory(
        clientId,
        payment.id,
        payment.invoice_id || null,
        payment.amount / 100,
        payment.currency || 'INR',
        'failed',
        `Payment failed. Status: ${payment.status}. Error: ${payment.error_description || 'Unknown error'}`
    );
    if (historyResult?.affectedRows === 0) {
        throw new HttpError("Failed to record failed payment", 500, 'HISTORY_CREATE_FAILED');
    }

    const statusResult = await subscriptionRepository.updateSubscriptionStatus(clientId, 'payment_failed');
    if (statusResult?.affectedRows === 0) {
        throw new HttpError("Failed to update subscription status", 500, 'SUBSCRIPTION_UPDATE_FAILED');
    }
};

export const checkSubscriptionStatus = async (clientId) => {
    try {
        if (clientId === process.env.SUPER_ADMIN_ID) {
            return true;
        }

        const subscription = await subscriptionRepository.findSubscriptionByClientId(clientId);

        if (subscription.length === 0) {
            return false;
        }

        const sub = subscription[0];
        const today = new Date();
        const endDate = new Date(sub.end_date);
        const isExpired = endDate <= today;
        return !isExpired;
    } catch (error) {
        return false;
    }
};

export const fetchSubscriptionStatus = async (clientId) => {
    const subscription = await subscriptionRepository.findSubscriptionByClientId(clientId);

    if (subscription.length === 0) {
        throw new HttpError("No subscription found for this client", 404);
    }

    const sub = subscription[0];
    const today = new Date();
    const endDate = new Date(sub.end_date);
    const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const isExpired = endDate <= today;

    return {
        status: "success",
        subscription: {
            ...sub,
            is_expired: isExpired,
            remaining_days: isExpired ? 0 : remainingDays,
            days_since_expiry: isExpired ? Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)) : 0
        }
    };
};

export const fetchSubscriptionHistory = async (clientId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const history = await subscriptionRepository.findSubscriptionHistory(clientId, parseInt(limit), offset);
    const total = await subscriptionRepository.countSubscriptionHistory(clientId);

    return {
        status: "success",
        data: {
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total[0].total,
                pages: Math.ceil(total[0].total / limit)
            }
        }
    };
};
