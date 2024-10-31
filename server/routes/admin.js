import { Router } from "express";
const router = Router();

import { mainAdmin } from "../controllers/admin.js";
import { messageUser } from "../controllers/contact.js";
import ensureAuthenticated from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

router.get('/administrator', isAdmin, ensureAuthenticated, mainAdmin);
router.get('/admin-message-user', isAdmin, ensureAuthenticated, messageUser);

export default router;
