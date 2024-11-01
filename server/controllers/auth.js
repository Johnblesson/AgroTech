import express from 'express';
import mongoose from 'mongoose';
const app = express();
import User from '../models/auth.js';
import { body, validationResult } from 'express-validator';
// import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import useragent from 'useragent';
import geoip from 'geoip-lite'; // For country detection
import passport from '../passport/passport-config.js';
import { activeSessions } from '../passport/passport-config.js'
import { checkUserMessages } from '../controllers/contact.js'
import dotenv from 'dotenv';
dotenv.config();

// Sign Up Controller
export const signUp = async (req, res) => {
  // Validation checks
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'Validation errors occurred. Please check your inputs.');
    return res.redirect('/signup');
  }

  req.session = req.session || {};

  // Create a session
  req.session.user = {
    isSignUp: true,
    isLogin: true,
  };

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Check for duplicate username before uploading the photo
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      req.flash('error', 'Username is already taken. Please choose another.');
      return res.redirect('/signup');
    }

    // Ensure the password meets the required criteria before uploading the photo
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordPattern.test(req.body.password)) {
      req.flash('error', 'Password is weak. It must contain at least one uppercase letter, one lowercase letter, and be at least 6 characters long.');
      return res.redirect('/signup');
    }

    // All validation checks have passed; now handle the file upload
    if (!req.file) {
      req.flash('error', 'No file uploaded. Please upload your profile picture.');
      return res.redirect('/signup');
    }

    if (!req.file.location) {
      req.flash('error', 'File upload failed. Please try again.');
      return res.redirect('/signup');
    }

    // Prepare user data after successful validation and file upload
    const userData = new User({
      fullname: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio,
      password: hashedPassword,
      photo: req.file.location,  // Store the S3 file location
      role: req.body.role,
      status: req.body.status,
      sudo: req.body.sudo,
      accountant: req.body.accountant,
      manager: req.body.manager,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save user data to the database
    const savedData = await userData.save();
    // console.log('User data saved:', savedData);
    req.flash('success', 'Sign-up successful! You can now log in.');
    res.redirect('/login');
  } catch (error) {
    console.error('Sign-Up Error:', error);
    req.flash('error', 'An error occurred while signing up. Please try again later.');
    res.redirect('/signup');
  }
};


// Google Oauth
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleAuthCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/'
});


// Login Controller
export const logIn = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err) {
        req.flash('error', 'An error occurred during login. Please try again.');
        return res.redirect('/login');
      }

      if (!user) {
        req.flash('error', info.message || 'User does not exist.');
        return res.redirect('/login');
      }

      if (user.status === 'active') {
        req.login(user, async (loginErr) => {
          if (loginErr) {
            req.flash('error', 'Login failed. Please try again.');
            return res.redirect('/login');
          }

          const ip = req.ip;
          const agent = useragent.parse(req.headers['user-agent']);
          const country = geoip.lookup(ip)?.country || 'Unknown';

          await User.findByIdAndUpdate(user._id, {
            $set: {
              lastLoginIP: ip,
              lastLoginDevice: agent.toString(),
              lastLoginCountry: country,
            },
            $push: {
              loginHistory: { ip, device: agent.toString(), country },
            },
          });

          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
          delete user.password;
          req.session.user = user;

          if (user.twoFactorEnabled) {
            return res.redirect('/2fa-verify');
          }

          // Check if the user has messages
          const hasMessages = await checkUserMessages(user._id);

          let redirectUrl = '';
          if (user.role === 'admin') {
            redirectUrl = `/admin-home?token=${token}`;
          } else {
            redirectUrl = `/home?token=${token}`;
          }

          // Redirect with an alert if there are messages
          if (hasMessages) {
            return res.redirect(`${redirectUrl}&alert=You have new messages`);
          } else {
            return res.redirect(redirectUrl);
          }
        });
      } else {
        req.flash('error', 'Forbidden: User status is inactive.');
        return res.redirect('/login');
      }
    } catch (catchErr) {
      req.flash('error', 'An internal server error occurred. Please try again later.');
      return res.redirect('/login');
    }
  })(req, res, next);
};


// Active session
export const activeUserSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch active user sessions
    // Assuming `activeSessions` is an array of user IDs representing active sessions
    const activeSessionUserIds = Array.from(activeSessions); // Replace this with your actual logic to get active session user IDs

    // Paginate the active sessions
    const users = await User.find({ '_id': { $in: activeSessionUserIds } })
                            .skip(skip)
                            .limit(limit);

    // Count the total number of active sessions
    const totalEntries = await User.countDocuments({ '_id': { $in: activeSessionUserIds } });

    const totalPages = Math.ceil(totalEntries / limit);

    // Render the active-sessions view with the paginated user data
    res.render('active-sessions', { data: users, currentPage: page, totalPages: totalPages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Render the login page
export const getLoginPage = (req, res) => {
  const ip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || '';

  const timestamp = new Date().toISOString();
  console.log('IP address:', ip, '/login', timestamp);

  // Get error messages from flash
  const errorMessages = req.flash('error');

  res.render('login', { errorMessages });
};


// Render the login page
export const getSignUpPage = (req, res) => {
  const ip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || '';

  const timestamp = new Date().toISOString();
  console.log('IP address:', ip, '/signup', timestamp);

  // Get error messages from flash
  const errorMessages = req.flash('error');

  res.render('signup', { errorMessages });
};



// Controller to render the login history page
export const loginHistory = async (req, res) => {
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
    // Retrieve the user from the session
    // const user = req.session.user;
    const user = req.isAuthenticated() ? req.user : (req.session ? req.session.user : null);
    
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Fetch the user data from the database to ensure we have the latest login history
    const currentUser = await User.findById(user._id).select('loginHistory lastLoginIP lastLoginDevice lastLoginCountry');

    if (!currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

        // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
        const sudo = user && user.sudo ? user.sudo : false;

        // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
        const accountant = user && user.accountant ? user.accountant : false;
    
        // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
        const manager = user && user.manager ? user.manager : false;

        const role = user ? user.role : null; // Get user role if user is authenticated

        const greeting = getTimeOfDay();

    // Render the login-history view with the user's login history and last login info
    res.render('login-history', {
      user: {
        lastLoginIP: currentUser.lastLoginIP,
        lastLoginDevice: currentUser.lastLoginDevice,
        lastLoginCountry: currentUser.lastLoginCountry,
        loginHistory: currentUser.loginHistory
      }, accountant, sudo, manager, role, greeting, user, alert: req.query.alert, // Pass the alert message to the view
    });
  } catch (error) {
    console.error('Error rendering login history page:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// Remove login history item
export const removeLoginHistory = async (req, res) => {
  try {
    const { id } = req.params; // Get the history item ID from the URL
    const userId = req.session.user._id; // Get the user's ID from the session

    // Fetch the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Remove the login history item
    user.loginHistory = user.loginHistory.filter(history => history._id.toString() !== id);
    await user.save(); // Save the updated user document

    res.redirect('/login-history'); // Redirect to the login history page
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Controller to clear all login history
export const clearLoginHistory = async (req, res) => {
  try {
    // Retrieve the user from the session or request object (based on your authentication setup)
    const user = req.isAuthenticated() ? req.user : (req.session ? req.session.user : null);
    
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // Fetch the user data from the database to ensure we have the latest data
    const currentUser = await User.findById(user._id);

    if (!currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Clear the login history
    currentUser.loginHistory = [];
    await currentUser.save(); // Save the updated user document

    // Optionally, you can pass a success message to the query string for feedback in the UI
    res.redirect('/login-history?alert=Login history cleared successfully');
  } catch (error) {
    console.error('Error clearing login history:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};



// Get All Users Controller
export const getAllUsers = async (req, res) => {

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
  
    res.render('all-users', { 
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


// Get All Users Controller
export const OnlyUsers = async (req, res) => {

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
    const totalEntries = await User.countDocuments({ role: 'user' });

    const totalPages = Math.ceil(totalEntries / limit);

    const user = req.isAuthenticated() ? req.user : null;

     // Fetch all users with role 'agent' from the database excluding the password field
     const users = await User.aggregate([
      { $match: { role: 'user' } }, // Match only users with the role 'agent'
      { $project: { password: 0 } }, // Exclude the password field
      { $skip: skip }, // Pagination: Skip the records for previous pages
      { $limit: limit } // Pagination: Limit the number of results per page
    ]);
  
    res.render('all-users', { 
      data: users, 
      locals,
      user,
      currentPage: page, 
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching users.');
  }
};

// Get All Users Controller
export const onlyAdmins = async (req, res) => {

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
    const totalEntries = await User.countDocuments({ role: 'admin'});

    const totalPages = Math.ceil(totalEntries / limit);

    const user = req.isAuthenticated() ? req.user : null;

      // Fetch all users with role 'agent' from the database excluding the password field
      const users = await User.aggregate([
        { $match: { role: 'admin' } }, // Match only users with the role 'agent'
        { $project: { password: 0 } }, // Exclude the password field
        { $skip: skip }, // Pagination: Skip the records for previous pages
        { $limit: limit } // Pagination: Limit the number of results per page
      ]);
  
    res.render('all-users', { 
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


export const onlyAgents = async (req, res) => {

  const locals = {
    title: "All Agents",
    description: "This is the agents page.",
  };

  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Count total number of agents
    const totalEntries = await User.countDocuments({ role: 'agent' });

    const totalPages = Math.ceil(totalEntries / limit);

    const user = req.isAuthenticated() ? req.user : null;

    // Fetch all users with role 'agent' from the database excluding the password field
    const users = await User.aggregate([
      { $match: { role: 'agent' } }, // Match only users with the role 'agent'
      { $project: { password: 0 } }, // Exclude the password field
      { $skip: skip }, // Pagination: Skip the records for previous pages
      { $limit: limit } // Pagination: Limit the number of results per page
    ]);

    res.render('all-users', { 
      data: users, 
      locals,
      user,
      currentPage: page, 
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching agents.');
  }
};

  


// Get All Users Controller
export const allAdminUser = async (req, res) => {

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
  
    res.render('all-users-sudo', { 
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

// Only role === user


// Only role === admin


// Only role === agent


// Get
export const edituser = async (req, res) => {
  const locals = {
    title: "Edit user",
    description: "This is the edit user page.",
  };

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
    const users = await User.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    const user = req.isAuthenticated() ? req.user : null;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;
     
    const accountant = user && user.accountant ? user.accountant : false;

    res.render("edit-user", {
      locals,
      users,
      greeting,
      user,
      sudo,
      manager,
      accountant,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    // Handle errors gracefully
    console.error(error.message);
    res.status(404).send("User not found");
  }
};

// Update user data #Sudo Admin
export const updateUser = async (req, res) => {
  try {
    // Extract the User ID from the request parameters
    const { id } = req.params;

    // Find the User record by ID and update its fields
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the User record exists
    if (!updatedUser) {
      return res.status(404).json({ message: 'User record not found' });
    }

    // Respond with the updated User record
    // res.status(200).json(updatedStorage);
    res.render('success/users');
  } catch (error) {
    console.error('Error updating User record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user data
export const deleteUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
    res.render("success/delete-user");
  } catch (error) {
    console.log(error);
  }
};


// View Edit password GET REQUEST Admin
export const viewChangePwdPage = async (req, res) => {

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
    const users = await User.findOne({ _id: req.params.id });

    // Check if the user exists
    if (!users) {
      return res.status(404).send('User not found');
  }

  // Access the role from the retrieved user data
  const role = users.role;

  const user = req.isAuthenticated() ? req.user : null;

  // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
  const sudo = user && user.sudo ? user.sudo : false;

  // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
  const accountant = user && user.accountant ? user.accountant : false;

  // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
  const manager = user && user.manager ? user.manager : false;

  // Determine the time of the day
  const greeting = getTimeOfDay();

    // Check the role and render the appropriate page
    if (role === 'admin') {
      // Render the admin update password page
      res.render('update-password', {
          users,
          greeting,
          user,
          sudo,
          accountant,
          manager,
          role
      });
  } else if (role === 'user') {
      // Render the user update password page
      res.render('update-password-user', {
          users, 
          greeting,
          user,
          role
      });
  } else {
      // Handle other roles or unauthorized access
      res.status(403).send('Unauthorized');
  }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
};


// Change Password Controller
export const changePassword = async (req, res) => {
  try {
    const { userId, username, email, oldPassword, newPassword } = req.body;

    let user;

    // Check if userId is provided
    if (userId) {
      // Find the user by userId
      user = await User.findById(userId);
    } else {
      // If userId is not provided, check by username or email
      user = await User.findOne({ $or: [{ username }, { email }] });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the old password matches the user's current password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    // Validate the new password format
    if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long and contain both uppercase and lowercase letters.',
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // res.status(200).json({ message: 'Password changed successfully' });
    res.render('success/password');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while changing password.');
  }
};


// View Edit password GET REQUEST Admin
export const settings = async (req, res) => {

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
    const user = req.isAuthenticated() ? req.user : null;

    const role = user ? user.role : null; // Get user role if user is authenticated
  
    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;
    
    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;
  
    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const users = await User.findOne({ _id: req.params.id });

    const isAdmin = role === 'admin'; // Define isAdmin based on the role
  
    // Determine the time of the day
    const greeting = getTimeOfDay();  
        // Render the admin update password page
        res.render('admin-settings', {
            greeting, // Greeting message for admin
            user,
            role,
            sudo,
            accountant,
            manager,
            users,
            isAdmin, // Pass isAdmin to the template
            alert: req.query.alert, // Pass the alert message
        });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
  };



// Get sudo only Page Controller 404
export const getSudoOnly = (req, res) => {
  const ip =
    req.headers['cf-conneting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || '';

  const timestamp = new Date().toISOString();
  console.log('ip address:', ip, 'attempt accessing the sudo-only route', timestamp);
  res.render('404-sudo', {
  });
};

// Get sudo only Page Controller
export const getAdminOnly = (req, res) => {
  const ip =
    req.headers['cf-conneting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || '';

  const timestamp = new Date().toISOString();
  console.log('ip address:', ip, 'attempt accessing the admin-only route', timestamp);
  res.render('404-admin', {
  });
};

// Go back function
export const goBack = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role === 'admin') {
      res.redirect('/admin-home');
    } else {
      res.redirect('/home');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while going back.');
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;
      await User.findByIdAndDelete(userId);
      req.logout(); // Log the user out after deletion
      res.redirect('/'); // Redirect to homepage or another appropriate page
  } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
  }
};
