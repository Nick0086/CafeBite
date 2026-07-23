import { Router } from "express";
import * as templateController from "./template.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { subscriptionMiddleware } from "../../middleware/subcription.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createTemplateValidator, updateTemplateValidator, getTemplateByIdValidator } from "./template.validator.js";

const router = Router();

router.get("/", authMiddleware, subscriptionMiddleware, templateController.fetchAllTemplates);
router.get("/:templateId", authMiddleware, subscriptionMiddleware, getTemplateByIdValidator, validate, templateController.fetchTemplateById);
router.post("/", authMiddleware, subscriptionMiddleware, createTemplateValidator, validate, templateController.createTemplate);
router.put("/:templateId", authMiddleware, subscriptionMiddleware, updateTemplateValidator, validate, templateController.updateTemplate);

export default router;
