import Contacts from "../models/contact.js"; // Contact model
import User from "../models/auth.js"; // User model
import moment from "moment"; // Date formatting library

// Controller function to create a new Contacts
export const createContacts = async (req, res) => {
  try {
    // Extracting data from request body
    const { fullname, phone, location, username, createdBy, msg } = req.body;

    // Create a new Contacts object with form data
    const contactsForm = new Contacts({
    fullname,
    phone,
    location,
    username,
    createdBy,
    msg,
      createdAt: new Date(), // Assuming createdAt and updatedAt are Date objects
      updatedAt: new Date()
    });

    // Saving the Contacts to the database
    const savedContacts = await contactsForm.save();

    // Sending a success response
    res.status(201).render('success/contacts')
    console.log(savedContacts);
  } catch (error) {
    // Sending an error response
    res.status(400).json({ error: error.message });
  }
};


// Get All Users Controller
export const getAllContacts = async (req, res) => {

    try {
      const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
      const limit = 15; // Number of entries per page
      const skip = (page - 1) * limit;
  
      // Fetch all storage data
      // const allStorage = await User.find().skip(skip).limit(limit);
      const totalEntries = await Contacts.countDocuments();
  
      const totalPages = Math.ceil(totalEntries / limit);
  
      // Fetch all users from the database
      // const users = await User.find({}, '-password'); // Exclude password field from the response
      const contact = await Contacts.aggregate([
        // Stage 1: Exclude password field from the response
        { $project: { password: 0 } },
        // Stage 2: Skip and limit
        { $skip: skip },
        { $limit: limit }
    ]);
    
      res.render('all-contacts', { 
        contact: contact, 
        currentPage: page, 
        totalPages: totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
    }
  };

  // Get contact form
export const getContactForm = async (req, res) => {

    // Function to determine the time of the day
    const getTimeOfDay = () => {
      const currentHour = new Date().getHours();
  
      if (currentHour >= 5 && currentHour < 12) {
        return 'Good Morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        return 'Good Afternoon';
      } else {
        return 'Good Evening';
      }
    };
  
    try {
      // Determine the time of the day
      const greeting = getTimeOfDay();
  
      // Check if the user is authenticated
      const user = req.isAuthenticated() ? req.user : null;

      const role = user.role;
  
      // Render the apply page with the necessary data
      res.render('contact', {
        user,
        greeting,
        role,
        alert: req.query.alert, // Pass the alert message
      });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

// Get admin contact form
export const getAdminContactForm = async (req, res) => {

  // Function to determine the time of the day
  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  try {
    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated
    const user = req.isAuthenticated() ? req.user : null;

    const role = user.role;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    // Render the apply page with the necessary data
    res.render('contact-admin', {
      user,
      greeting,
      sudo,
      accountant,
      role,
      manager,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};

  export const messageView = async (req, res) => {
    try {
      const contact = await Contacts.findOne({ _id: req.params.id });
  
      res.render("view-message", {
        contact,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Delete message data
  export const deleteMessage = async (req, res) => {
    try {
      await Contacts.deleteOne({ _id: req.params.id });
      res.render("success/delete-message");
    } catch (error) {
      console.log(error);
    }
  };


  // Render the send message page
  export const renderSendMessagePage = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.render('send-message-to-users', { userId, userFullname: null, errorMessage: 'User not found', successMessage: null });
      }
  
      const userFullname = user.fullname;
      res.render('send-message-to-users', { userId, userFullname, errorMessage: null, successMessage: null });
    } catch (error) {
      console.error(error);
      res.render('send-message-to-users', { userId, userFullname: null, errorMessage: 'An error occurred', successMessage: null });
    }
  };


// Controller to send a message to a user
export const sendMessageToUser = async (req, res) => {
  const { userId } = req.params; // Get the user ID from the route parameters
  const { message, link } = req.body; // Get the message and link from the request body
  const senderId = req.user._id; // Assuming the admin is logged in and req.user contains the admin's info

  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      // If the user is not found, render the form with an error message
      return res.render('send-message-to-users', { userId, userFullname: null, errorMessage: 'User not found', successMessage: null });
    }

    // Create a new message object, including the link if provided
    const newMessage = {
      senderId,
      message,
      link: link || null // Only add the link if it was provided
    };

    // Push the new message into the user's messages array
    user.messages.push(newMessage);

    // Save the user with the new message
    await user.save();

    // Render the form with a success message
    res.render('send-message-to-users', { userId, userFullname: user.fullname, errorMessage: null, successMessage: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    // Render the form with an error message in case of any errors
    res.render('send-message-to-users', { userId, userFullname: null, errorMessage: 'An error occurred while sending the message', successMessage: null });
  }
};


// Controller to display user messages
export const displayUserMessages = async (req, res) => {
  const { userId } = req.params;
  const user = req.isAuthenticated() ? req.user : null;

  try {
    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    // Find the user and populate the messages with sender and replies information
    const userWithMessages = await User.findById(userId).populate({
      path: 'messages.senderId', // Populate sender information for messages
      select: 'fullname username', // Adjust fields to display as needed
    }).populate({
      path: 'messages.replies.senderId', // Populate sender information for replies
      select: 'fullname username', // Adjust fields to display as needed
    });

    // Check if the user exists
    if (!userWithMessages) {
      return res.status(404).send('User not found');
    }

    // Ensure messages array is defined (in case user has no messages)
    const messages = userWithMessages.messages || [];

    // Render the EJS template and pass the messages and user info to it
    res.render('view-user-message', { 
      messages: messages, 
      user: userWithMessages 
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).send('An error occurred');
  }
};





// Get all users message page Controller
export const messageUser = async (req, res) => {

  const locals = {
    title: "All Users",
    description: "This is the all users page.",
  };

  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await User.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    const user = req.isAuthenticated() ? req.user : null;

    // Fetch all users from the database
    // const users = await User.find({}, '-password'); // Exclude password field from the response
    const users = await User.aggregate([
      // Stage 1: Exclude password field from the response
      { $project: { password: 0 } },
      // Stage 2: Skip and limit
      { $skip: skip },
      { $limit: limit }
  ]);
  
    res.render('message-user', { 
      data: users, 
      locals,
      user,
      // greeting,
      currentPage: page, 
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching users.');
  }
};




// Controller to send a message with an optional URL link to all users
export const sendMessageToAllUsers = async (req, res) => {
  const { message, link } = req.body;

  try {
    // Get all users
    const users = await User.find();

    // Loop through each user and add the message with the link
    await Promise.all(users.map(async (user) => {
      user.messages.push({
        senderId: req.user._id, // Assuming the sender is the authenticated user
        message,
        link, // Optional URL link
      });
      await user.save();
    }));

    res.render('success/message-sent-to-all-users');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while sending messages.');
  }
};



// Controller to render the Send Message to All Users page
export const renderSendMessageToAllUsersPage = (req, res) => {
  try {
    // Check for any flash messages (success or error) stored in the session
    const successMessage = req.flash('successMessage');
    const errorMessage = req.flash('errorMessage');

    // Render the EJS template and pass the flash messages (if any)
    res.render('send-message-to-all-users', { 
      successMessage: successMessage.length > 0 ? successMessage[0] : null, 
      errorMessage: errorMessage.length > 0 ? errorMessage[0] : null 
    });
  } catch (error) {
    console.error("An error occurred while rendering the Send Message to All Users page:", error);
    res.status(500).send("An error occurred while rendering the page.");
  }
};



export const deleteUserMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id; // Assuming the user is authenticated and req.user contains the user's info

  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find the message in the user's messages array and remove it
    user.messages = user.messages.filter(message => message._id.toString() !== messageId);

    // Save the updated user
    await user.save();

    // Redirect or respond with success
    res.render('success/delete-message'); // Replace with your actual messages page route
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while deleting the message');
  }
};





// Check user messages
export const checkUserMessages = async (userId) => {
  try {
    // Find the user and populate the messages with sender information
    const userWithMessages = await User.findById(userId).populate({
      path: 'messages.senderId',
      select: 'fullname username',
    });

    // Check if the user has messages
    if (userWithMessages && userWithMessages.messages.length > 0) {
      return true; // User has messages
    } else {
      return false; // No messages
    }
  } catch (error) {
    console.error('Error checking user messages:', error);
    return false; // Default to no messages in case of an error
  }
};





// // Render the get message history page
// export const getMessageHistory = async (req, res) => {
//   try {
//     // Get the messages from all users
//     const usersWithMessages = await User.find({ 'messages.0': { $exists: true } })
//       .select('fullname username messages')
//       .populate('messages.senderId', 'fullname username')
//       .sort({ 'messages.date': -1 });

//     // Flatten the messages array from all users into a single list
//     const messages = usersWithMessages.reduce((acc, user) => {
//       user.messages.forEach(message => {
//         acc.push({
//           userId: user._id, // Include the user ID for each message
//           fullname: user.fullname,
//           username: user.username,
//           sender: message.senderId,
//           message: message.message,
//           link: message.link,
//           date: message.date,
//           messageId: message._id // Include the message ID for deletion
//         });
//       });
//       return acc;
//     }, []);

//     // Sort the flattened messages by date in descending order
//     messages.sort((a, b) => new Date(b.date) - new Date(a.date));

//     res.render('message-history', { messages, moment });
//   } catch (error) {
//     console.error(error);
//     req.flash('error', 'An error occurred while fetching the message history.');
//     res.redirect('/admin-home');
//   }
// };


// Render the get message history page
export const getMessageHistory = async (req, res) => {
  try {
    // Get the messages from all users, including their replies
    const usersWithMessages = await User.find({ 'messages.0': { $exists: true } })
      .select('fullname username messages')
      .populate({
        path: 'messages.senderId',
        select: 'fullname username'
      })
      .populate({
        path: 'messages.replies.senderId',
        select: 'fullname username'
      })
      .sort({ 'messages.date': -1 });

    // Flatten the messages array from all users into a single list
    const messages = usersWithMessages.reduce((acc, user) => {
      user.messages.forEach(message => {
        acc.push({
          userId: user._id, // Include the user ID for each message
          fullname: user.fullname,
          username: user.username,
          sender: message.senderId,
          message: message.message,
          link: message.link,
          date: message.date,
          replies: message.replies,
          messageId: message._id // Include the message ID for deletion
        });
      });
      return acc;
    }, []);

    // Sort the flattened messages by date in descending order
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.render('message-history', { messages, moment });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while fetching the message history.');
    res.redirect('/admin-home');
  }
};



// In your controller
export const markMessagesRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update all messages as read for the authenticated user
    await User.updateMany(
      { _id: userId, "messages.read": false },
      { $set: { "messages.$[].read": true } } // Mark all messages as read
    );
    
    res.status(200).send('Messages marked as read');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to mark messages as read');
  }
};



// Controller to delete a message from the user's messages array
export const  adminDeleteUserMessage = async (req, res) => {
  try {
    const { userId, messageId } = req.params;

    // Find the user by ID and remove the message with the given messageId
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { messages: { _id: messageId } } }, // Pull removes the message with the matching _id
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Redirect or send a success response
    res.redirect('/message-history'); // Adjust this redirect based on your app's routing
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




export const renderReplyPage = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Find the user with the message
    const user = await User.findOne({ 'messages._id': messageId }).populate('messages.senderId');
    if (!user) {
      req.flash('errorMessage', 'Message not found');
      return res.redirect('/message-history');
    }

    // Find the specific message
    const message = user.messages.id(messageId);
    if (!message) {
      req.flash('errorMessage', 'Message not found');
      return res.redirect('/message-history');
    }

    // Check for any flash messages (success or error) stored in the session
    const successMessage = req.flash('successMessage');
    const errorMessage = req.flash('errorMessage');

    // Render the reply page
    res.render('reply-page', { 
      message, 
      successMessage: successMessage.length > 0 ? successMessage[0] : null, 
      errorMessage: errorMessage.length > 0 ? errorMessage[0] : null 
    });
  } catch (error) {
    console.error('Error rendering reply page:', error);
    req.flash('errorMessage', 'An error occurred while loading the reply page');
    res.redirect('/message-history');
  }
};



export const sendReply = async (req, res) => {
  const { messageId } = req.params;
  const { replyMessage } = req.body;

  try {
    // Find the user with the message
    const user = await User.findOne({ 'messages._id': messageId });
    if (!user) {
      req.flash('errorMessage', 'Message not found');
      return res.redirect(`/reply/${messageId}`);
    }

    // Find the specific message
    const message = user.messages.id(messageId);
    if (!message) {
      req.flash('errorMessage', 'Message not found');
      return res.redirect(`/reply/${messageId}`);
    }

    // Add the reply to the message
    message.replies.push({
      senderId: req.user._id, // Assuming `req.user` contains the logged-in user's info
      replyMessage,
      date: new Date()
    });

    // Save the user document
    await user.save();

    // Set a success flash message
    req.flash('successMessage', 'Reply sent successfully');
    res.redirect(`/reply/${messageId}`);
  } catch (error) {
    console.error('Error sending reply:', error);
    req.flash('errorMessage', 'An error occurred while sending the reply');
    res.redirect(`/reply/${messageId}`);
  }
};



// Controller to see replies of a message
export const seeReplies = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Find the user with the message and populate the replies
    const user = await User.findOne({ 'messages._id': messageId }).populate('messages.replies.senderId');
    if (!user) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Find the specific message
    const message = user.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Render the replies page
    res.render('see-replies', { 
      message
     });
  } catch (error) {
    console.error('Error retrieving replies:', error);
    res.status(500).send('Internal Server Error');
  }
};




