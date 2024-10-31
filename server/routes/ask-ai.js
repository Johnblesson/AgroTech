import { Router } from "express";
const router = Router();

import { getAskAi, getAIResponse } from "../controllers/askAIController.js";
import ensureAuthenticated from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

router.post('/ask-ai', isAdmin, ensureAuthenticated, getAIResponse);
router.get('/ask-ai', isAdmin, ensureAuthenticated, getAskAi);

export default router;