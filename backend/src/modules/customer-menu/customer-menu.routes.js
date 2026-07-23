import { Router } from "express";
import * as customerMenuController from "./customer-menu.controller.js";
import validate from "../../middleware/validate.middleware.js";
import { getMenuByTableValidator, getMenuCategoryValidator, getMenuItemsValidator } from "./customer-menu.validator.js";

const router = Router();

router.get("/template/:userId/:tableId", getMenuByTableValidator, validate, customerMenuController.fetchMenuByTableId);
router.get("/category/:userId", getMenuCategoryValidator, validate, customerMenuController.fetchMenuCategories);
router.get("/items/:userId", getMenuItemsValidator, validate, customerMenuController.fetchMenuItems);

export default router;
