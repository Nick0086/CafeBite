import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(1, 'Category is required'),
    status: z.number().optional(),
});
