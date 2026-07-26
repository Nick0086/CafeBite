import { format, parseISO } from 'date-fns';

export const formatFeedbackDate = (date) =>
    date ? format(parseISO(date), 'dd-MM-yyyy hh:mm:ss a') : 'N/A';

export const formatCommentDate = (date) =>
    date ? format(parseISO(date), 'dd-MM-yyyy hh:mm:ss a') : '';
