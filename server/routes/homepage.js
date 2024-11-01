import { Router } from "express";
const router = Router();

import { homeRoute, adminHomeRoute } from "../render/render.js";
import { myPost, myPostAdmin, updateProducts , deleteProduct, getUpdateForm } from "../controllers/myPost.js";
import ensureAuthenticated from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import cacheMiddleware from "../middlewares/cacheMiddleware.js"

// Home Page Route
router.get("/home", ensureAuthenticated, cacheMiddleware, homeRoute);
router.get("/admin-home", ensureAuthenticated, isAdmin, cacheMiddleware, adminHomeRoute);

// My Post Route
router.get("/my-post", ensureAuthenticated, cacheMiddleware, myPost);
router.get("/admin-my-post", ensureAuthenticated, cacheMiddleware, isAdmin, myPostAdmin);
router.get("/update-product/:id", ensureAuthenticated, cacheMiddleware, getUpdateForm);
// Route to update an product
router.patch('/update-product/:id', ensureAuthenticated, updateProducts );
// Route to delete an product
router.delete('/products/:id', ensureAuthenticated, deleteProduct);

export default router
