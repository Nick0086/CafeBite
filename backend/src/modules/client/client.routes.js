import { Router } from "express";
import * as clientController from "./client.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { registerClientValidator, updateClientProfileValidator } from "./client.validator.js";

const router = Router();

router.post('/register', registerClientValidator, validate, clientController.createClient);
router.get('/', authMiddleware, clientController.fetchClientDataById);
router.put('/update-client-profile', authMiddleware, updateClientProfileValidator, validate, clientController.updateClientProfile);

export default router;
