import { z } from "zod";
import { passwordSchema } from "@/common/validation/profile.schemas";

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

export const registerSchemas = {
    stepOne: registerStepOneSchema,
    stepTwo: registerStepTwoSchema,
    stepThree: registerStepThreeSchema,
    stepFour: registerStepFourSchema,
};
