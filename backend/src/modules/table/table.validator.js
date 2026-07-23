import { body, param } from "express-validator";

export const createTableValidator = [
    body("tableNumbers")
        .notEmpty().withMessage("Table number is required")
        .isLength({ max: 50 }).withMessage("Max 50 characters")
        .trim(),
    body("templateId")
        .notEmpty().withMessage("Template ID is required")
        .trim()
];

export const updateTableValidator = [
    param("tableId")
        .notEmpty().withMessage("Table ID is required")
        .trim(),
    body("tableNumbers")
        .notEmpty().withMessage("Table number is required")
        .isLength({ max: 50 }).withMessage("Max 50 characters")
        .trim(),
    body("templateId")
        .notEmpty().withMessage("Template ID is required")
        .trim()
];
