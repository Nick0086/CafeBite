import { body } from "express-validator";

export const registerClientValidator = [
    body("firstName")
        .notEmpty().withMessage("First name is required")
        .isLength({ max: 255 }).withMessage("First name must be less than 255 characters")
        .trim(),
    body("lastName")
        .notEmpty().withMessage("Last name is required")
        .isLength({ max: 255 }).withMessage("Last name must be less than 255 characters")
        .trim(),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),
    body("phoneNumber")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ min: 10, max: 15 }).withMessage("Phone number must be between 10 and 15 characters")
        .trim(),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("cafeName")
        .notEmpty().withMessage("Cafe name is required")
        .isLength({ max: 255 }).withMessage("Cafe name must be less than 255 characters")
        .trim(),
];

export const updateClientProfileValidator = [
    body("firstName")
        .notEmpty().withMessage("First name is required")
        .isLength({ max: 255 }).withMessage("First name must be less than 255 characters")
        .trim(),
    body("lastName")
        .notEmpty().withMessage("Last name is required")
        .isLength({ max: 255 }).withMessage("Last name must be less than 255 characters")
        .trim(),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),
    body("phoneNumber")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ min: 10, max: 15 }).withMessage("Phone number must be between 10 and 15 characters")
        .trim(),
];
