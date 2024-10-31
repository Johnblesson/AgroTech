import { Router } from "express";
const router = Router();

import { createAgentForm, agentForm, agentProgram, agentFormAdmin} from "../controllers/agents.js";
import ensureAuthenticated from "../middlewares/auth.js";
// import { checkSudoMiddleware } from '../middlewares/sudo.js'
import { checkManagerMiddleware } from '../middlewares/manager.js'
import { isAdmin } from "../middlewares/isAdmin.js";

router.post("/agents", ensureAuthenticated, createAgentForm);
router.get("/agents", ensureAuthenticated, agentForm);
router.get("/agents-admin", agentFormAdmin);
router.get("/agent-program", ensureAuthenticated, isAdmin, agentProgram);


export default router;