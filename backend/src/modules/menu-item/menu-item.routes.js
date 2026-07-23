import { Router } from "express";
import * as menuItemController from "./menu-item.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { subscriptionMiddleware } from "../../middleware/subcription.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createMenuItemValidator, updateMenuItemValidator } from "./menu-item.validator.js";

const router = Router();

router.get('/', authMiddleware, subscriptionMiddleware, menuItemController.fetchAllMenuItems);
router.post('/', authMiddleware, subscriptionMiddleware, createMenuItemValidator, validate, menuItemController.createMenuItem);
router.put('/:menuItemId', authMiddleware, subscriptionMiddleware, updateMenuItemValidator, validate, menuItemController.updateMenuItem);

export default router;
