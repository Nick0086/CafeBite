import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { subscriptionMiddleware } from "../../middleware/subcription.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createCategoryValidator, updateCategoryValidator } from "./category.validator.js";

const router = Router();

router.get("/", authMiddleware, subscriptionMiddleware, categoryController.fetchAllCategories);
router.post("/", authMiddleware, subscriptionMiddleware, createCategoryValidator, validate, categoryController.createCategory);
router.put("/:categoryId", authMiddleware, subscriptionMiddleware, updateCategoryValidator, validate, categoryController.updateCategory);

export default router;
