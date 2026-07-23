import { Router } from "express";
import * as tableController from "./table.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { subscriptionMiddleware } from "../../middleware/subcription.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createTableValidator, updateTableValidator } from "./table.validator.js";

const router = Router();

router.post("/", authMiddleware, subscriptionMiddleware, createTableValidator, validate, tableController.createTable);
router.put("/:tableId", authMiddleware, subscriptionMiddleware, updateTableValidator, validate, tableController.updateTable);
router.get("/", authMiddleware, subscriptionMiddleware, tableController.fetchAllTables);
router.get("/:tableId", authMiddleware, subscriptionMiddleware, tableController.fetchTableById);

export default router;
