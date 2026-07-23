import { body, param } from "express-validator";

export const createTemplateValidator = [
    body("name")
        .notEmpty().withMessage("Template name is required")
        .isLength({ max: 255 }).withMessage("Template name must be less than 255 characters")
        .trim(),
    body("config")
        .optional()
        .isObject().withMessage("Config must be an object"),
];

export const updateTemplateValidator = [
    param("templateId")
        .notEmpty().withMessage("Template ID is required")
        .trim(),
    body("name")
        .notEmpty().withMessage("Template name is required")
        .isLength({ max: 255 }).withMessage("Template name must be less than 255 characters")
        .trim(),
    body("config")
        .optional()
        .isObject().withMessage("Config must be an object"),
];

export const getTemplateByIdValidator = [
    param("templateId")
        .notEmpty().withMessage("Template ID is required")
        .trim(),
];
