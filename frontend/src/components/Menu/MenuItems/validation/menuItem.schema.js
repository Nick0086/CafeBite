import { z } from 'zod';

export const menuItemSchema = z.object({
    name: z.string().min(1, 'Menu item name is required'),
    description: z.string().min(1, 'Menu item description is required'),
    category_id: z.string().min(1, 'Please select a category'),
    price: z
        .number({ invalid_type_error: 'Price must be a valid number' })
        .min(0.01, 'Price is required'),
    veg_status: z.string().min(1, 'Please select a food type'),
    cover_image: z.any().refine((value) => value !== null && value !== undefined && value !== '', {
        message: 'Cover image is required',
    }),
});
