import { Router } from "express";
const router = Router();

import 
{ 
    createContacts, 
    getContactForm, 
    getAllContacts, 
    messageView, 
    deleteMessage, 
    getAdminContactForm, 
    displayUserMessages, 
    renderSendMessagePage, 
    sendMessageToUser, 
    sendMessageToAllUsers, 
    renderSendMessageToAllUsersPage,
    deleteUserMessage,
    getMessageHistory,
    adminDeleteUserMessage,
    renderReplyPage,
    // submitReply,
    seeReplies,
    sendReply,
} 
    from "../controllers/contact.js";
import ensureAuthenticated from "../middlewares/auth.js";
import { checkSudoMiddleware } from '../middlewares/sudo.js'
import cacheMiddleware from "../middlewares/cacheMiddleware.js"
import { isAdmin } from "../middlewares/isAdmin.js";

// Add more routes here
router.get('/contact', ensureAuthenticated, cacheMiddleware, getContactForm);
router.get('/admin-contact', ensureAuthenticated, cacheMiddleware, isAdmin, getAdminContactForm);
router.post('/contact', ensureAuthenticated, createContacts);
router.get('/all-messages', ensureAuthenticated, cacheMiddleware, isAdmin, getAllContacts);
router.get('/view-message/:id', ensureAuthenticated, isAdmin, cacheMiddleware, messageView)
router.delete('/delete-message/:id', ensureAuthenticated, isAdmin, checkSudoMiddleware, deleteMessage);
router.get('/delete-message/:id', ensureAuthenticated, isAdmin, checkSudoMiddleware, deleteMessage);

// Route to render the send message page for admin
router.get('/send-message/:userId', ensureAuthenticated, renderSendMessagePage);

// Route to handle sending a message
router.post('/send-message/:userId', ensureAuthenticated, sendMessageToUser);

// Route to display user's messages
router.get('/my-messages/:userId', ensureAuthenticated, displayUserMessages);

// Route to send a message to all users
router.post('/send-message-to-all-users', ensureAuthenticated, isAdmin, sendMessageToAllUsers);

// Route to render the send message page for all users
router.get('/send-message-to-all-users', ensureAuthenticated, isAdmin, renderSendMessageToAllUsersPage)

// router.delete('/delete-user-message/:messageId', ensureAuthenticated, deleteMessage);

// Define the route to delete a user message
router.post('/delete-user-message/:messageId', ensureAuthenticated, deleteUserMessage);

// Get message history
router.get('/message-history', ensureAuthenticated, isAdmin,  getMessageHistory )

router.post('/admin-delete-user-message/:userId/:messageId', ensureAuthenticated, isAdmin,   adminDeleteUserMessage);

// Route to render the reply page
router.get('/reply/:messageId', ensureAuthenticated, renderReplyPage);

// Route to handle reply submission
router.post('/reply/:messageId', ensureAuthenticated, sendReply);

// Route to see replies for a specific message
router.get('/see-replies/:messageId', ensureAuthenticated, seeReplies);


export default router;
