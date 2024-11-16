import { Router } from "express";
const router = Router();

import { createFarmerForm, farmerForm, farmerProgram, farmerFormAdmin} from "../controllers/farmers.js";
import ensureAuthenticated from "../middlewares/auth.js";
// import { checkManagerMiddleware } from '../middlewares/manager.js'
import { isAdmin } from "../middlewares/isAdmin.js";

router.post("/farmers", ensureAuthenticated, createFarmerForm);
router.get("/apply-to-be-a-farmer", ensureAuthenticated, farmerForm);
router.get("/apply-farmers-admin", farmerFormAdmin);
router.get("/farmers-program-list", ensureAuthenticated, isAdmin, farmerProgram);

export default router;