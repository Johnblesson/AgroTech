import { Router } from "express";
const router = Router();

import { 
    createApplication, 
    getAllApplication, 
    editApplication, 
    deleteApplication, 
    application, 
    adminApplication, 
    updateApplication, 
    viewapplicantdetail,
    applyForSponsorship, 
    adminApplyForSponsorship, 
    createBoost, 
    getAllBoost, 
    editboost, 
    updateboost,
    deleteboost 
} from "../controllers/apply.js";
import ensureAuthenticated from "../middlewares/auth.js";
// import { checkSudoMiddleware } from '../middlewares/sudo.js'
import { checkManagerMiddleware } from '../middlewares/manager.js'
import { isAdmin } from "../middlewares/isAdmin.js";

// Apply for an property routes
router.post("/apply", ensureAuthenticated, createApplication);
router.get("/all-applications", ensureAuthenticated, getAllApplication);
router.get("/edit-application/:id", ensureAuthenticated, isAdmin, editApplication);
router.delete("/delete-application/:id", ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteApplication);
router.get("/delete-application/:id", ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteApplication);

router.get('/application-form', ensureAuthenticated, application)
router.get('/admin-application-form', ensureAuthenticated, adminApplication)
router.patch('/update-admin-application/:id', ensureAuthenticated, isAdmin, updateApplication);
router.get('/view-applicant-details/:id', ensureAuthenticated, isAdmin, viewapplicantdetail);

router.post("/apply-boost", ensureAuthenticated, createBoost);
router.get("/apply-for-sponsorship", ensureAuthenticated, applyForSponsorship);
router.get("/admin-apply-for-sponsorship", ensureAuthenticated, isAdmin, adminApplyForSponsorship);
router.get("/all-boost", ensureAuthenticated, isAdmin, getAllBoost);
router.get("/edit-boost/:id", ensureAuthenticated, isAdmin, editboost);
router.patch('/update-boost/:id', ensureAuthenticated, isAdmin, updateboost);
router.delete("/delete-boost/:id", ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteboost);
router.get("/delete-boost/:id", ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteboost);

export default router;
