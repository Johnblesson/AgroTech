import { Router } from "express";
const router = Router();

import 
    { 
    profile,  
    updateUser, 
    getUsers, 
    adminprofile,  
    view, 
    getUpdateProfile, 
    viewAdminProfile,
    getUserPostProfile,
    adminViewUserprofile
    } 
    from "../controllers/profile.js";
import ensureAuthenticated from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
// import { checkSudoMiddleware } from '../middlewares/sudo.js'
import cacheMiddleware from "../middlewares/cacheMiddleware.js"

router.get('/profile/:id', ensureAuthenticated, profile);
router.get('/admin-profile/:id', ensureAuthenticated, isAdmin, adminprofile);
router.patch('/update-profile/:id', ensureAuthenticated, updateUser);
router.get('/view/:id', ensureAuthenticated, cacheMiddleware, view);
router.get('/view-admin-profile/:id', ensureAuthenticated, isAdmin, viewAdminProfile);
router.get('/users', ensureAuthenticated, isAdmin, getUsers); // Route to get all users by the admin
router.get('/update-profile/:id([0-9a-fA-F]{24})', ensureAuthenticated, getUpdateProfile);
router.get('/user/:id', ensureAuthenticated, getUserPostProfile);
router.get('/admin-view-user-profile/:id', ensureAuthenticated, isAdmin, adminViewUserprofile);

export default router;
