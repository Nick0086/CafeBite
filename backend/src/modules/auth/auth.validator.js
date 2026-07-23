import { body, param } from "express-validator";

export const checkUserExistsValidator = [
    body("loginId")
        .notEmpty().withMessage("Login identifier is required")
        .trim(),
];

export const verifyUserPasswordValidator = [
    body("loginId")
        .notEmpty().withMessage("Login identifier is required")
        .trim(),
    body("loginType")
        .notEmpty().withMessage("Login type is required")
        .isIn(['EMAIL', 'MOBILE']).withMessage("Login type must be EMAIL or MOBILE"),
    body("password")
        .notEmpty().withMessage("Password is required"),
];

export const sendOneTimePasswordValidator = [
    body("loginId")
        .notEmpty().withMessage("Login identifier is required")
        .trim(),
    body("loginType")
        .notEmpty().withMessage("Login type is required")
        .isIn(['EMAIL', 'MOBILE']).withMessage("Login type must be EMAIL or MOBILE"),
];

export const verifyOneTimePasswordValidator = [
    body("OTP")
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

export const requestPasswordResetValidator = [
    param("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),
];

export const performPasswordResetValidator = [
    body("token")
        .notEmpty().withMessage("Reset token is required")
        .trim(),
    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const validatePasswordResetTokenValidator = [
    param("token")
        .notEmpty().withMessage("Reset token is required")
        .trim(),
];
