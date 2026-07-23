import { param } from "express-validator";

export const getMenuByTableValidator = [
    param("userId")
        .notEmpty().withMessage("User ID is required")
        .trim(),
    param("tableId")
        .notEmpty().withMessage("Table ID is required")
        .trim()
];

export const getMenuCategoryValidator = [
    param("userId")
        .notEmpty().withMessage("User ID is required")
        .trim()
];

export const getMenuItemsValidator = [
    param("userId")
        .notEmpty().withMessage("User ID is required")
        .trim()
];
