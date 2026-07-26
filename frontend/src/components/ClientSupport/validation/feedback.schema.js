import { z } from 'zod';
import { FEEDBACK_TYPES } from '../constants/clientSupport.constants';

export const feedbackSchema = z.object({
    type: z
        .string()
        .min(1, 'Feedback type is required')
        .refine((val) => FEEDBACK_TYPES.some((t) => t.value === val), { message: 'Invalid feedback type' }),
    title: z
        .string()
        .min(1, 'Title is required')
        .min(3, 'Title must be at least 3 characters')
        .max(255, 'Title cannot exceed 255 characters'),
    description: z
        .string()
        .min(1, 'Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description cannot exceed 5000 characters'),
});
