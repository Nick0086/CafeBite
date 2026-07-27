import { z } from "zod";

export const loginIdSchema = z.object({
    loginType: z
        .string({ required_error: 'Login type is required' })
        .refine((val) => ['EMAIL', 'MOBILE'].includes(val), { message: 'Invalid login type' }),
    loginId: z.string({ required_error: 'Please enter your email address or mobile number' })
        .min(1, 'Please enter your email address or mobile number'),
});

export const passwordLoginSchema = z.object({
    loginId: z.string({ required_error: 'Please enter your email address' })
        .min(1, 'Please enter your email address'),
    password: z.string({ required_error: 'Please enter your password' })
        .min(1, 'Please enter your password'),
});

export const otpLoginSchema = z.object({
    OTP: z.string({ required_error: 'Please enter your OTP' })
        .min(6, 'Please enter your OTP'),
});

export const loginSchemas = {
    loginId: loginIdSchema,
    password: passwordLoginSchema,
    otp: otpLoginSchema,
};