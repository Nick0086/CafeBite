import express from 'express';
import { registerClient } from '../controller/user.controller.js';

const router = express.Router();


router.post('/register', registerClient);

export default router;