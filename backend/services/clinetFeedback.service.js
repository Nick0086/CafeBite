import clinetFeedbackRepository from "../repositories/clinetFeedback.repository.js";

const fetchAllFeedback = async (userId) => {
    const feedback = await clinetFeedbackRepository.getAllFeedback(userId);
    return {
        success: true,
        message: feedback?.length > 0 ? "Feedback fetched successfully" : "No Feedback found.",
        categories: feedback || [],
        status: "success"
    };
};

export default { fetchAllFeedback };