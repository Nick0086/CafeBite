import { checkSubscriptionStatus } from "../modules/subscription/subscription.service.js";

export const subscriptionMiddleware = async (req, res, next) => {
    const clinentId = req.user.unique_id;
    const isSubscribed = await checkSubscriptionStatus(clinentId);

    if (!isSubscribed) {
        return res.status(405).json({ code: 'SUBSCRIPTION_EXPIRED', message: 'Clinet Subscription Expired' });
    }
    next();
};
