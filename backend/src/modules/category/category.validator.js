import { body, param } from "express-validator";

export const createCategoryValidator = [
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim()
];

export const updateCategoryValidator = [
    param("categoryId")
        .notEmpty().withMessage("Category ID is required")
        .trim(),
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
    body("status")
        .notEmpty().withMessage("Status is required")
        .isInt({ min: 0, max: 1 }).withMessage("Status must be 0 or 1")
];
