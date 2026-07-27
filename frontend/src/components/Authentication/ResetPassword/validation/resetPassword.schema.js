import { z } from "zod";
import { passwordSchema } from "@/common/validation/profile.schemas";

export const passwordResetSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
});
