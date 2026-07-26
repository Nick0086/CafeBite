import { z } from "zod";
import { passwordSchema } from "@/common/validation/profile.schemas";

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

export const passwordResetSchema = z.object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
});

export const registerStepOneSchema = z.object({
    firstName: z.string().min(2, {
        message: "First name must be at least 2 characters.",
    }).trim(),
    lastName: z.string().min(2, {
        message: "Last name must be at least 2 characters.",
    }).trim(),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }).trim().toLowerCase(),
    phoneNumber: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }).trim(),
    password: passwordSchema,
});

export const registerStepTwoSchema = z.object({
    cafeName: z.string().min(2, {
        message: "Cafe name must be at least 2 characters."
    }).trim(),
    cafeDescription: z
        .string()
        .min(10, { message: "Description must be at least 10 characters." })
        .max(500, { message: "Description must not exceed 500 characters." })
        .trim(),
    cafeLogo: z
        .instanceof(File, { message: "Please upload a valid file." })
        .optional(),
});

export const registerStepThreeSchema = z.object({
    cafeAddress: z.string().min(5, {
        message: "Address must be at least 5 characters.",
    }).trim(),
    cafeCity: z.number().int().positive(),
    cafeState: z.number().int().positive(),
    cafeCountry: z.number().int().positive(),
    cafeCurrency: z.string().min(1),
    cafeZip: z.string().min(5, {
        message: "ZIP/Postal code must be at least 5 characters.",
    }).trim(),
});

export const registerStepFourSchema = z.object({
    cafePhone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }).trim(),
});

export const loginSchemas = {
    loginId: loginIdSchema,
    password: passwordLoginSchema,
    otp: otpLoginSchema,
};

export const registerSchemas = {
    stepOne: registerStepOneSchema,
    stepTwo: registerStepTwoSchema,
    stepThree: registerStepThreeSchema,
    stepFour: registerStepFourSchema,
};
