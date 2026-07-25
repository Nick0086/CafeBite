import { razorpay } from "../../config/razorpay.js";

// ponytail: Razorpay disabled - uncomment when Razorpay credentials are configured
export const getPaymentsById = async (paymentId) => {
    if (!razorpay) {
        throw new Error("Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment.");
    }
    const response = await razorpay.payments.fetch(paymentId);
    return response;
}