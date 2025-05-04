import { z } from "zod";
import * as yup from 'yup';

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const personalFormSchema = z.object({
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
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
});

export const cafeBasicFormSchema = z.object({
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
        .optional()
        .refine(
            (file) => !file || file.size <= MAX_FILE_SIZE,
            { message: "Image size must be less than 5MB." }
        )
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            { message: "Please upload a valid image file (JPEG, PNG, or WebP)." }
        ),
});

export const cafeLocationFormSchema = z.object({
    cafeAddress: z.string().min(5, {
        message: "Address must be at least 5 characters.",
    }).trim(),
    cafeCity: z.number({
        required_error: "City is required.",
        invalid_type_error: "Please select a valid city.",
    }).int().positive({
        message: "Please select a valid city.",
    }),
    cafeState: z.number({
        required_error: "State/Province is required.",
        invalid_type_error: "Please select a valid state/province.",
    }).int().positive({
        message: "Please select a valid state/province.",
    }),
    cafeCountry: z.number({
        required_error: "Country is required.",
        invalid_type_error: "Please select a valid country.",
    }).int().positive({
        message: "Please select a valid country.",
    }),
    cafeCurrency: z.string({
        required_error: "Currency is required.",
    }).min(1, {
        message: "Please select a currency.",
    }),
    cafeZip: z.string().min(5, {
        message: "ZIP/Postal code must be at least 5 characters.",
    }).trim(),
});

export const cafeContactFormSchema = z.object({
    cafePhone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }).trim(),
    cafeEmail: z
        .string()
        .trim()
        .toLowerCase()
        .refine(
            (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            { message: "Please enter a valid email address or leave empty." }
        ),
    cafeWebsite: z
        .string()
        .trim()
        .toLowerCase()
        .refine(
            (val) => val === "" || /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*$/.test(val),
            { message: "Please enter a valid website URL or leave empty." }
        ),
    socialInstagram: z.string().trim().optional(),
    socialFacebook: z.string().trim().optional(),
    socialTwitter: z.string().trim().optional(),
});



export const VALIDATION_SCHEMAS = {
    loginId: yup.object({
        loginType: yup
            .string()
            .oneOf(['EMAIL', 'MOBILE'], 'Invalid login type')
            .required('Login type is required'),
        loginId: yup.string().required('Please enter your email address or mobile number'),
    }),
    password: yup.object({
        loginId: yup.string().required('Please enter your email address'),
        password: yup.string().required('Please enter your password'),
    }),
    otp: yup.object({
        OTP: yup.string().required('Please enter your OTP').min(6, 'Please enter your OTP'),
    })
};