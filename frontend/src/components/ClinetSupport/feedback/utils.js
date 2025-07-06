import * as yup from 'yup';

export const feedBackListQueryKeys = {
    'FEEDBACK_LIST': 'feedback-list',
    'FEEDBACK_DETAIL': 'feedback-detail',
}

export const feedbackTypeOptions = [
    { value: 'complaint', label: 'Complaint' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'billing', label: 'Billing Issue' },
    { value: 'feature_request', label: 'Feature Request' },
];

export const feedbackdefaultValues = {
    title: '',
    description: '',
    type: '',
};

export const feedbackSchema = yup.object().shape({
    type: yup
        .string()
        .required('Feedback type is required')
        .oneOf(['complaint', 'bug', 'suggestion', 'billing', 'feature_request'], 'Invalid feedback type'),
    title: yup
        .string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters')
        .max(255, 'Title cannot exceed 255 characters'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description cannot exceed 5000 characters'),
});

export const getCategoryColor = (category) => {
    switch (category) {
        case "complaint":
            return { color: "red", label: "Complaint" }
        case "billing":
            return { color: "blue", label: "Billing Issue" }
        case "bug":
            return { color: "yellow", label: "Bug Report" }
        case "suggestion":
            return { color: "green", label: "Suggestion" }
        case "feature_request":
            return { color: "purple", label: "Feature Request" }
        default:
            return { color: "gray", label: "Unknown" }
    }
}

export const getStatusLabel = (category) => {
    switch (category) {
        case "open":
            return 'Pending'
        case "in_progress":
            return 'in Progress'
        case "resolved":
            return 'Completed'
        case "cancelled":
            return 'Cancelled'
        default:
            return 'Unknown'
    }
}

export const feedBackType = [
    { label: 'Complaint', value: 'complaint', color: '#fbbf24', className: 'bg-red-400' },
    { label: 'Billing Issue', value: 'billing', color: '#38bdf8', className: 'bg-blue-400' },
    { label: 'Bug Report', value: 'bug', color: '#2dd4bf', className: 'bg-yellow-400' },
    { label: 'Suggestion', value: 'suggestion', color: '#f87171', className: 'bg-green-400' },
    { label: 'Feature Request', value: 'feature_request', color: '#f87171', className: 'bg-purple-400' },
]

export const feedBackStatus = [
    { label: 'Pending', value: 'open', description: "Issue is open and needs attention", color: '#fbbf24', className: 'bg-yellow-400' },
    { label: 'In Progress', value: 'in_progress', description: "Currently being worked on", color: '#38bdf8', className: 'bg-sky-400' },
    { label: 'Completed', value: 'resolved', description: "Ticket has been completed", color: '#2dd4bf', className: 'bg-green-400' },
    { label: 'Cancelled', value: 'cancelled', description: "Ticket was cancelled", color: '#f87171', className: 'bg-red-400' },
]

export const getColor = (color) => {
    switch (color) {
        case 'open':
            return 'orange';
        case 'in_progress':
            return 'sky';
        case 'resolved':
            return 'green';
        case 'cancelled':
            return 'red';
        default:
            return 'slate';
    }
}