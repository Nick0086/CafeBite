import { checkSubscriptionStatus } from "../controller/subscription.controller.js";
import { handleError } from "../utils/utils.js";

export const subscriptionMiddleware = async (req, res, next) => {
    try {
        const clinentId = req.user.unique_id;
        const isSubscribed = await  checkSubscriptionStatus(clinentId);

        if (!isSubscribed) {
            return res.status(405).json({ code: 'SUBSCRIPTION_EXPIRED', message: 'Clinet Subscription Expired' });
        } else {
            next();
        }
    } catch (error) {
        handleError('subscription.middleware.js', 'subscriptionMiddleware', res, error, 'An unexpected error occurred while verifying the subscription.');   
    }
};