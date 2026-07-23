import { body, param } from "express-validator";

export const createMenuItemValidator = [
    body("category_id").notEmpty().withMessage("Category ID is required").trim(),
    body("name").notEmpty().withMessage("Name is required").isLength({ max: 255 }).withMessage("Max 255 chars").trim(),
    body("description").optional().trim(),
    body("price").notEmpty().withMessage("Price is required").isFloat({ min: 0 }).withMessage("Price must be >= 0"),
    body("availability").optional().isIn(["in_stock", "out_of_stock"]).withMessage("Invalid availability"),
    body("veg_status").optional().isIn(["veg", "non_veg", "egg"]).withMessage("Invalid veg status"),
];

export const updateMenuItemValidator = [
    param("menuItemId").notEmpty().withMessage("Menu item ID is required").trim(),
    body("category_id").notEmpty().withMessage("Category ID is required").trim(),
    body("name").notEmpty().withMessage("Name is required").isLength({ max: 255 }).withMessage("Max 255 chars").trim(),
    body("description").optional().trim(),
    body("price").notEmpty().withMessage("Price is required").isFloat({ min: 0 }).withMessage("Price must be >= 0"),
    body("availability").optional().isIn(["in_stock", "out_of_stock"]).withMessage("Invalid availability"),
    body("status").optional().isInt({ min: 0, max: 1 }).withMessage("Status must be 0 or 1"),
    body("veg_status").optional().isIn(["veg", "non_veg", "egg"]).withMessage("Invalid veg status"),
];
