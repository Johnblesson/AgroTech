import { Router } from "express";
const router = Router();

import {
    createProduct,
    getProductById,
    updateProductById,
    deleteProductById,
    editproduct,
    productUpdate,
    allProducts,
    // updateProducts,
    adminEditProducts, // get edit products for admin
    adminVerifyProduct,
    verifyUpdateProduct,
    viewproduct,
    sponsorship,
    updateAdminSponsorship,
    editSponsorship,
    searchProduct,
    searchProductAdmin,
    availability,
    editAvailability,
    updateAdminAvailability,
    getNotifications,
    deleteNotification,
    productDetail, 
    // adminProductDetail 
} from '../controllers/products.js';

import { allAdminProducts, allVirtualProducts } from '../render/render.js'
import ensureAuthenticated from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import cacheMiddleware from "../middlewares/cacheMiddleware.js"
import { checkSudoMiddleware } from '../middlewares/sudo.js'
import { checkManagerMiddleware } from '../middlewares/manager.js'
// import { autoRefreshMiddleware } from '../middlewares/autoRefreshRoute.js';
import { uploadPhotos } from '../upload/upload.js';

// router.post('/create-product', upload.single('photo'), createProduct);
router.post('/create-product', uploadPhotos, createProduct);
router.get('/edit-product', ensureAuthenticated, cacheMiddleware, editproduct);
router.get('/admin-marketplace', ensureAuthenticated, cacheMiddleware, allAdminProducts);
router.get('/all-products', ensureAuthenticated, cacheMiddleware, allProducts);
router.get('/marketplace', ensureAuthenticated, cacheMiddleware, allVirtualProducts);
router.get('/products/:id', ensureAuthenticated, cacheMiddleware, getProductById);
router.put('/products/:id', ensureAuthenticated, isAdmin, updateProductById);
router.delete('/delete-products/:id', ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteProductById);
router.get('/delete-products/:id', ensureAuthenticated, isAdmin, checkManagerMiddleware, deleteProductById);
// router.patch('/update-products/:id', ensureAuthenticated, isAdmin, updateProducts);
router.patch('/update-admin-products/:id', ensureAuthenticated, checkManagerMiddleware, isAdmin, productUpdate);
router.get('/view-product-details/:id', ensureAuthenticated, cacheMiddleware, isAdmin, viewproduct);
router.get("/edit-admin-product/:id", ensureAuthenticated, cacheMiddleware, isAdmin, adminEditProducts);
router.patch("/edit-admin-product/:id", ensureAuthenticated, isAdmin, productUpdate);
router.get("/product-detail/:id", ensureAuthenticated, cacheMiddleware, productDetail);

// Notifications
router.get('/notifications', ensureAuthenticated, isAdmin, checkSudoMiddleware, getNotifications);
router.get('/delete-notification/:id', ensureAuthenticated, isAdmin, checkSudoMiddleware, deleteNotification);

// search for products
router.get("/search", ensureAuthenticated, searchProduct)
router.get("/search-admin", ensureAuthenticated, isAdmin, searchProductAdmin)

router.get('/verify-product', ensureAuthenticated, isAdmin, adminVerifyProduct);
router.get('/verify-update-product/:id', isAdmin, ensureAuthenticated, verifyUpdateProduct);

// sponsorship
router.get('/sponsorship', isAdmin, ensureAuthenticated, sponsorship)
router.get('/edit-sponsorship/:id', isAdmin, ensureAuthenticated, editSponsorship)
router.patch('/update-admin-sponsorship/:id', ensureAuthenticated, isAdmin, checkManagerMiddleware, updateAdminSponsorship);

// availability
router.get('/availability', isAdmin, ensureAuthenticated, availability)
router.get('/edit-availability/:id', isAdmin, ensureAuthenticated, editAvailability)
router.patch('/update-admin-availability/:id', ensureAuthenticated, isAdmin, checkManagerMiddleware, updateAdminAvailability);

export default router;
