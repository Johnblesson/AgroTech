// routes/communityRoutes.js
import express from 'express';
import {
  createPost,
  getPosts,
  likePost,
  commentOnPost,
  deletePost,
} from '../controllers/community.js';

const router = express.Router();

import ensureAuthenticated from "../middlewares/auth.js";
import cacheMiddleware from "../middlewares/cacheMiddleware.js"
import { isAdmin } from "../middlewares/isAdmin.js";

router.get('/', ensureAuthenticated, cacheMiddleware, getPosts); // View community page
router.post('/create', ensureAuthenticated, createPost); // Create a post
router.post('/:postId/like', ensureAuthenticated, likePost); // Like a post
router.post('/:postId/comment', ensureAuthenticated, commentOnPost); // Comment on a post
router.delete('/post/:postId', ensureAuthenticated, deletePost);

export default router;
