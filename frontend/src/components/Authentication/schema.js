import { z } from "zod";

export const registerFormSchema = z.object({
    // Personal Information
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    mobile: z.string().min(10, "Please enter a valid mobile number"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),

    // Cafe Information
    cafe_name: z.string().min(3, "Cafe name must be at least 3 characters"),
    logo_url: z.string().optional(),

    // Location Information
    address_line1: z.string().min(5, "Address must be at least 5 characters"),
    address_line2: z.string().optional(),
    postal_code: z.string().min(3, "Please enter a valid postal code"),
    country_id: z.string().min(1, "Country is required"), // Mandatory
    state_id: z.string().min(1, "State is required"), // Mandatory
    city_id: z.string().min(1, "City is required"), // Mandatory

    // Additional Settings
    currency_code: z.string().min(1, "Currency code is required"), // Explicitly mandatory with default
});