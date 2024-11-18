import { Router } from "express";
const router = Router();

import { 
    about, 
    service, 
    features, 
    blog, 
    getPostProduct, 
    getPostProductAdmin,
    guestPage, 
    faq,
    agroNews,
    faqAdmin,
    farmingTips,
    weatherUpdate,
    agentController, 
    viewIPAddresses, 
    deleteIPAddress,
    ipMetrics,
    viewIPCities,
    viewipaddressdetails,
    pieChartPage,
    renderCountryMetricsPage 
} from "../render/render.js";

import { 
    adminAbout, 
    adminFeatures, 
    adminService, 
    adminBlog, 
    termsConditions, 
    registrationProcessStatement 
} from "../render/admin.js";

import { 
    getAllUsers, 
    allAdminUser, 
    settings, 
    onlyAdmins, 
    onlyFarmer, 
    OnlyUsers 
} from "../controllers/auth.js"

import ensureAuthenticated from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

// The isFarmer middleware is not yet implemented
// import { isFarmer } from "../middlewares/isFarmer.js";
import { isAccountant } from "../middlewares/isAccountant.js";
import cacheMiddleware from "../middlewares/cacheMiddleware.js"
import { checkSudoMiddleware } from '../middlewares/sudo.js';
// import IPAddress from "../models/ipaddress.js";


// Add more routes here
// router.get("/all-properties", ensureAuthenticated, allProducts );

router.get("/", cacheMiddleware, guestPage)

router.get("/about", cacheMiddleware, ensureAuthenticated, about);

router.get("/features", cacheMiddleware, ensureAuthenticated, features);

router.get("/service", cacheMiddleware, ensureAuthenticated, service);

router.get("/blog", cacheMiddleware, ensureAuthenticated, blog);

router.get('/agro-news', cacheMiddleware, ensureAuthenticated, agroNews) // farmingTips

router.get('/tips', cacheMiddleware, ensureAuthenticated, farmingTips)

router.get('/weather-update', cacheMiddleware, ensureAuthenticated, weatherUpdate)

router.get('/create-product',  cacheMiddleware, ensureAuthenticated, getPostProduct) // isFarmer: preventing user to access the route

router.get('/create-product-admin', cacheMiddleware, ensureAuthenticated, isAdmin, getPostProductAdmin)

router.get('/all-users', isAdmin, cacheMiddleware, ensureAuthenticated, getAllUsers)

router.get('/all-admin-user', isAdmin, isAccountant, cacheMiddleware, ensureAuthenticated, allAdminUser)

router.get('/only-admins', isAdmin, cacheMiddleware, ensureAuthenticated, onlyAdmins)

router.get('/only-farmers', isAdmin, cacheMiddleware, ensureAuthenticated, onlyFarmer)

router.get('/only-users', isAdmin, cacheMiddleware, ensureAuthenticated, OnlyUsers)

// Admin routes
router.get("/admin-about", cacheMiddleware, ensureAuthenticated, adminAbout);

router.get("/admin-features", cacheMiddleware, ensureAuthenticated, adminFeatures);

router.get("/admin-service", cacheMiddleware, ensureAuthenticated, adminService);

router.get("/admin-blog", cacheMiddleware, ensureAuthenticated, adminBlog);

router.get("/terms-and-conditions", cacheMiddleware, termsConditions)

router.get("/registration-process-statement", cacheMiddleware, registrationProcessStatement)
 
router.get("/faq", cacheMiddleware, ensureAuthenticated, faq)

router.get("/faq-admin", cacheMiddleware, ensureAuthenticated, isAdmin, faqAdmin)

router.get("/farming-program", cacheMiddleware, ensureAuthenticated, agentController)

router.get("/view-ip-addresses", cacheMiddleware, ensureAuthenticated, isAdmin, checkSudoMiddleware, viewIPAddresses)
router.delete('/ip-addresses/:id', isAdmin, ensureAuthenticated, checkSudoMiddleware, deleteIPAddress)
router.get('/ip-addresses/:id', isAdmin, ensureAuthenticated, checkSudoMiddleware, deleteIPAddress)

router.get("/metrics", ensureAuthenticated, cacheMiddleware, isAdmin, checkSudoMiddleware, ipMetrics);
router.get("/cities", ensureAuthenticated, cacheMiddleware, isAdmin, checkSudoMiddleware, viewIPCities);
router.get("/ip-address-details/:id", ensureAuthenticated, cacheMiddleware, isAdmin, checkSudoMiddleware, viewipaddressdetails);
router.get("/pie-chart", ensureAuthenticated, cacheMiddleware, isAdmin, checkSudoMiddleware, pieChartPage);
router.get("/country-metrics", ensureAuthenticated, cacheMiddleware, isAdmin, checkSudoMiddleware, renderCountryMetricsPage)
router.get("/settings", ensureAuthenticated, cacheMiddleware, settings);


// Post products success message
router.get('/admin-product-success', cacheMiddleware, ensureAuthenticated, (req, res) => {
    res.render('success/admin-product')
})

router.get('/product-success', cacheMiddleware,  ensureAuthenticated, (req, res) => {
    res.render('success/farmers-product')
})

router.get("/services-fee-agreement", cacheMiddleware, (req, res) => {
    res.render("service-fee-agreement")
})

router.get("/privacy-policy",  cacheMiddleware, (req, res) => {
    res.render("privacy-policy")
})

router.get("/user-product-success", ensureAuthenticated, cacheMiddleware, (req, res) => {
    res.render("success/user-product")    
});

router.get("/admin-product-success", ensureAuthenticated, isAdmin, cacheMiddleware, (req, res) => {
    res.render("success/admin-product")    
});

router.get('/invalid-2FA-code', (req, res) => {
    res.render('success/invalid-2FA-code')
})

export default router;
