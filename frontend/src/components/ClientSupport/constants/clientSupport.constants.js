export const feedbackQueryKeys = {
    LIST: 'feedback-list',
    DETAIL: 'feedback-detail',
    STATS: 'feedback-stats',
};

export const FEEDBACK_TYPES = [
    { value: 'complaint', label: 'Complaint' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'billing', label: 'Billing Issue' },
    { value: 'feature_request', label: 'Feature Request' },
];

export const FEEDBACK_STATUS = [
    { label: 'Pending', value: 'open', description: 'Issue is open and needs attention', color: '#fbbf24', className: 'bg-yellow-400' },
    { label: 'In Progress', value: 'in_progress', description: 'Currently being worked on', color: '#38bdf8', className: 'bg-sky-400' },
    { label: 'Completed', value: 'resolved', description: 'Ticket has been completed', color: '#2dd4bf', className: 'bg-green-400' },
    { label: 'Cancelled', value: 'cancelled', description: 'Ticket was cancelled', color: '#f87171', className: 'bg-red-400' },
];

export const FEEDBACK_TYPE_OPTIONS = [
    { label: 'Complaint', value: 'complaint', color: '#fbbf24', className: 'bg-red-400' },
    { label: 'Billing Issue', value: 'billing', color: '#38bdf8', className: 'bg-blue-400' },
    { label: 'Bug Report', value: 'bug', color: '#2dd4bf', className: 'bg-yellow-400' },
    { label: 'Suggestion', value: 'suggestion', color: '#f87171', className: 'bg-green-400' },
    { label: 'Feature Request', value: 'feature_request', color: '#f87171', className: 'bg-purple-400' },
];

export const FEEDBACK_STATUS_COLOR = {
    open: 'orange',
    in_progress: 'sky',
    resolved: 'green',
    cancelled: 'red',
    default: 'slate',
};

export const FEEDBACK_TYPE_COLOR = {
    complaint: { color: 'red', label: 'Complaint' },
    billing: { color: 'blue', label: 'Billing Issue' },
    bug: { color: 'yellow', label: 'Bug Report' },
    suggestion: { color: 'green', label: 'Suggestion' },
    feature_request: { color: 'purple', label: 'Feature Request' },
    default: { color: 'gray', label: 'Unknown' },
};

export const FEEDBACK_STATUS_LABEL = {
    open: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Completed',
    cancelled: 'Cancelled',
    default: 'Unknown',
};

export const feedbackDefaultValues = {
    title: '',
    description: '',
    type: '',
};
