import { api, handleApiError } from "@/utils/api";

export const verifySubscriptionPayment = async (id) => {
    try {
        const response = await api.get(`/subscription/verify-payment-with-razorpay/${id}`);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}