import { z } from 'zod';

export const templateSchema = z.object({
    name: z.string().min(1, 'Template name is required').max(255),
});
