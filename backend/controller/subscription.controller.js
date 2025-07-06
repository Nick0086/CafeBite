import { getPaymentsById } from "../services/razorpay/razorpay.service.js";
import query from "../utils/query.utils.js";
import { handleError } from "../utils/utils.js";
// Enhanced subscription payment verification with history management
export const verifySubscriptionPayment = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        const { razorpay_payment_id } = req.params;

        if (!razorpay_payment_id) {
            return res.status(400).json({ status: "failed", message: "Missing Razorpay payment ID." });
        }

        const payment = await getPaymentsById(razorpay_payment_id);
        console.log('Payment fetched:', payment);

        if (payment.status === 'captured' || payment.status === 'authorized') {
            await processSubscriptionPayment(clientId, payment);

            return res.status(200).json({ status: "success", message: "Payment captured successfully and subscription updated.", paymentDetails: payment });
        } else {
            // Record failed payment in history
            await recordFailedPayment(clientId, payment);

            return res.status(400).json({ status: "failed", message: `Payment not successful. Status: ${payment.status}`, paymentDetails: payment });
        }
    } catch (error) {
        handleError('subscription.controller.js', 'verifySubscriptionPayment', res, error, 'An unexpected error occurred while verifying the subscription.');
    }
};

// Process successful subscription payment
const processSubscriptionPayment = async (clientId, payment) => {
    try {
        // Get current subscription details
        const currentSubscription = await query('SELECT * FROM client_subscriptions WHERE client_id = ?', [clientId]);

        let newStartDate, newEndDate;
        const today = new Date();

        if (currentSubscription.length > 0) {
            const subscription = currentSubscription[0];
            const currentEndDate = new Date(subscription.end_date);

            console.log({
                currentEndDate: currentEndDate.toISOString().split('T')[0],
                today: today.toISOString().split('T')[0],
                isExpired: currentEndDate > today
            });


            if (currentEndDate > today) {
                // Not expired - calculate remaining days and add to new period
                const remainingDays = Math.ceil((currentEndDate - today) / (1000 * 60 * 60 * 24));
                console.log(`Subscription not expired. Remaining days: ${remainingDays}`);

                // Set new start date as today, end date includes remaining days
                newStartDate = today;
                newEndDate = new Date(today);
                newEndDate.setDate(newEndDate.getDate() + 30 + remainingDays + 1); // 30 days + remaining days
            } else {
                // Expired - start fresh period
                console.log('Subscription expired. Starting fresh period.');
                newStartDate = today;
                newEndDate = new Date(today);
                newEndDate.setDate(newEndDate.getDate() + 30 + 1); // 30 days from today
            }
            console.log(`New start date: ${newStartDate.toISOString().split('T')[0]}`);
            console.log(`New end date: ${newEndDate.toISOString().split('T')[0]}`);

            // Update existing subscription
            await query(`UPDATE client_subscriptions SET razorpay_subscription_id = ?, amount = ?, currency = ?,  start_date = ?, end_date = ?,  status = 'active' WHERE client_id = ?`, [payment.id, (payment.amount / 100), payment.currency || 'INR', newStartDate.toISOString().split('T')[0], newEndDate.toISOString().split('T')[0], clientId]);
        } else {
            // Create new subscription
            newStartDate = today;
            newEndDate = new Date(today);
            newEndDate.setDate(newEndDate.getDate() + 30 + 1); // 30 days from today

            await query(`INSERT INTO client_subscriptions  (client_id, razorpay_subscription_id, amount, currency, start_date, end_date, status)  VALUES (?, ?, ?, ?, ?, ?, 'active')`, [
                clientId,
                payment.id,
                payment.amount / 100,
                payment.currency || 'INR',
                newStartDate.toISOString().split('T')[0],
                newEndDate.toISOString().split('T')[0]
            ]);
        }

        await query(` INSERT INTO client_subscription_history  (client_id, razorpay_payment_id, razorpay_invoice_id, amount, currency, status, notes) VALUES (?, ?, ?, ?, ?, 'paid', ?)`, [
            clientId,
            payment.id,
            payment.invoice_id || null,
            payment.amount / 100,
            payment.currency || 'INR',
            `Payment successful. Subscription period: ${newStartDate.toISOString().split('T')[0]} to ${newEndDate.toISOString().split('T')[0]}`
        ]);

        console.log('Subscription and payment history updated successfully');

    } catch (error) {
        throw error;
    }
};

// Record failed payment attempt
const recordFailedPayment = async (clientId, payment) => {

    try {
        // Insert failed payment history record
        await query(` INSERT INTO client_subscription_history  (client_id, razorpay_payment_id, razorpay_invoice_id, amount, currency, status, notes)  VALUES (?, ?, ?, ?, ?, 'failed', ?)`, [
            clientId,
            payment.id,
            payment.invoice_id || null,
            payment.amount / 100, // Convert paise to rupees
            payment.currency || 'INR',
            `Payment failed. Status: ${payment.status}. Error: ${payment.error_description || 'Unknown error'}`
        ]);

        // Update subscription status to payment_failed if exists
        await query(`UPDATE client_subscriptions  SET status = 'payment_failed', updated_at = CURRENT_TIMESTAMPWHERE client_id = ? AND status = 'active'`, [clientId]);
        console.log('Failed payment recorded in history');
    } catch (error) {
        console.error('Error recording failed payment:', error);
        throw error;
    };
}

// Utility function to get subscription status and remaining days
export const getSubscriptionStatus = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        const subscription = await query('SELECT * FROM client_subscriptions WHERE client_id = ?', [clientId]);

        if (subscription.length === 0) {
            return res.status(404).json({ status: "not_found", message: "No subscription found for this client" });
        }

        const sub = subscription[0];
        const today = new Date();
        const endDate = new Date(sub.end_date);
        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        const isExpired = endDate <= today;

        return res.status(200).json({
            status: "success",
            subscription: {
                ...sub,
                is_expired: isExpired,
                remaining_days: isExpired ? 0 : remainingDays,
                days_since_expiry: isExpired ? Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)) : 0
            }
        });

    } catch (error) {
        handleError('subscription.controller.js', 'getSubscriptionStatus', res, error, 'An unexpected error occurred while fetching subscription status.');
    }
};

// Get subscription payment history
export const getSubscriptionHistory = async (req, res) => {
    try {
        const clientId = req.user?.unique_id;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const [history] = await query(`SELECT * FROM client_subscription_history WHERE client_id = ? ORDER BY paid_at DESC LIMIT ? OFFSET ?`, [clientId, parseInt(limit), offset]);

        const total = await query('SELECT COUNT(*) as total FROM client_subscription_history WHERE client_id = ?',[clientId]);

        return res.status(200).json({
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
        });

    } catch (error) {
        handleError('subscription.controller.js', 'getSubscriptionHistory', res, error, 'An unexpected error occurred while fetching subscription history.');
    }
};