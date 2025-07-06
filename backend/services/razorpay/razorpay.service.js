import { razorpay } from "../../config/razorpay.js";

export const getPaymentsById = async (paymentId) => {
    const response = await razorpay.payments.fetch(paymentId);
    return response;
}