import { Router } from "express";
const router = Router();

import 
{ 
    signUp, 
    logIn,
    getLoginPage,
    getSignUpPage,
    edituser, 
    updateUser, 
    deleteUser, 
    viewChangePwdPage, 
    changePassword,  
    googleAuth, 
    getSudoOnly,
    getAdminOnly,
    getFarmerOnly,
    goBack,
    deleteUserAccount,
    activeUserSessions,
    loginHistory,
    removeLoginHistory,
    clearLoginHistory
}
from "../controllers/auth.js";

import { 
    setup2FA, 
    verify2FA,
    toggle2FA 
} 
from '../controllers/2FA.js'
import upload from "../upload/upload.js";
import ensureAuthenticated from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
// import { checkSudoMiddleware } from "../middlewares/sudo.js";
import cacheMiddleware from "../middlewares/cacheMiddleware.js"
import { checkManagerMiddleware } from '../middlewares/manager.js'



//Auth Routes
router.post("/signup", upload.single("photo"), signUp);
router.post("/login", logIn);
router.get("/login", getLoginPage);
router.get("/signup", cacheMiddleware, getSignUpPage);
router.get("/active-sessions", ensureAuthenticated, isAdmin, activeUserSessions)
router.get("/edit-user/:id", ensureAuthenticated, isAdmin, edituser);
router.patch("/edit-user/:id", ensureAuthenticated, isAdmin, checkManagerMiddleware, updateUser)
router.delete("/delete-user/:id", ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteUser)
router.get("/delete-user/:id", ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteUser)
router.get("/update-password/:id", ensureAuthenticated, viewChangePwdPage)
// router.get("/update-password-user/:id", ensureAuthenticated, viewChangePwdPageUser)
router.patch("/update-password/:id", ensureAuthenticated, changePassword)


// google oauth
// router.get('/auth/google', googleAuth);
// router.get('/auth/google/callback', googleAuthCallback);

// Route to view login history
router.get('/login-history', ensureAuthenticated, loginHistory);

// Route to remove login history item
router.get('/remove-login-history/:id', ensureAuthenticated, removeLoginHistory);

// Route to clear login history
router.post('/clear-login-history', ensureAuthenticated, clearLoginHistory);

// Route to set up 2FA
router.get('/setup-2fa', ensureAuthenticated, setup2FA);

// Route to verify the 2FA token
router.post('/verify-2fa', ensureAuthenticated, verify2FA);

// Route to handle 2FA toggling
router.post('/2fa', ensureAuthenticated, toggle2FA);

// Route to render 2FA verification page
router.get('/2fa-verify', ensureAuthenticated, (req, res) => {
    const user = req.isAuthenticated() ? req.user : null;
    res.render('2fa-verify', { user });
})

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/'); 
});

// 404 Route
router.get('/forbidden', (req, res) => {
    res.render('404');
});

// Sudo only
router.get("/sudo-only", getSudoOnly)
router.get("/admin-only", getAdminOnly)
router.get("/farmer-only", getFarmerOnly)

// Route to handle goBack
router.get('/go-back', goBack);

router.delete('/delete-account', ensureAuthenticated, deleteUserAccount);
router.get('/delete-account', ensureAuthenticated, deleteUserAccount);

export default router;
