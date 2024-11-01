import Products from "../models/products.js";
import Application from "../models/apply.js";
import Boost from "../models/boost.js";
import Staffs from "../models/staffs.js";
import { io } from '../../server.js'; // Import the io instance

// Controller function to create a new application
export const createApplication = async (req, res) => {
  try {
    // Extracting data from request body
    const { title, phone, location, applyAid, username, address, address2, createdBy, comments, assignedStaff, staffInCharge } = req.body;

    // Create a new Application object with form data
    const applicationForm = new Application({
      title,
      phone,
      location,
      username,
      applyAid,
      address,
      address2,
      createdBy,
      role,
      comments,
      assignedStaff,
      staffInCharge,
      createdAt: new Date(), // Assuming createdAt and updatedAt are Date objects
      updatedAt: new Date()
    });

    // Saving the application to the database
    const savedApplication = await applicationForm.save();

    // Emit a new Application notification to all connected clients
    io.emit('new-application', { createdBy: savedApplication.createdBy, applyAid: savedApplication.applyAid, location: savedApplication.location });

    // Sending a success response
    res.status(201).render('success/application')
    console.log(savedApplication);
  } catch (error) {
    // Sending an error response
    res.status(400).json({ error: error.message });
  }
};


// Get all applications controller
export const getAllApplication = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Application.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    // Fetch all users from the database
    // const users = await User.find({}, '-password'); // Exclude password field from the response
    const apply = await Application.aggregate([
      // Stage 1: Exclude password field from the response
      { $project: { password: 0 } },
      // Stage 2: Skip and limit
      { $skip: skip },
      { $limit: limit }
  ]);
  
    res.render('all-application', { 
      apply: apply, 
      currentPage: page, 
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching users.');
  }
};

// Get edit applicaion
export const editApplication = async (req, res) => {
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
    const apply = await Application.findOne({ _id: req.params.id });

    // Fetch all staffs name
    const staffNames = await Staffs.distinct('staffName');

    // Determine the time of the day
    const greeting = getTimeOfDay();

    const user = req.isAuthenticated() ? req.user : null;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const accountant = user && user.accountant ? user.accountant : false;

    res.render("edit-application", {
      apply,
      greeting,
      user,
      sudo,
      manager,
      accountant,
      staffNames,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    // Handle errors gracefully
    console.error(error.message);
    res.status(404).send("User not found");
  }
};

// Delete application data
export const deleteApplication = async (req, res) => {
  try {
    await Application.deleteOne({ _id: req.params.id });
    res.render("success/delete-application");
  } catch (error) {
    console.log(error);
  }
};


// Get application
export const application = async (req, res) => {

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
    // Get the product ID and location from the query parameters
    const productId = req.query.pid;
    const location = req.query.location;
    const title = req.query.title;

    // Fetch the product details based on the ID
    const product = await Products.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated
    const user = req.isAuthenticated() ? req.user : null;

    const role = user.role;

    // Render the apply page with the necessary data
    res.render('apply', {
      user,
      greeting,
      product,
      pid: productId,
      location: location,
      title: title,
      role,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Admin Application
export const adminApplication = async (req, res) => {

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
    // Get the product ID and location from the query parameters
    const productId = req.query.pid;
    const location = req.query.location;
    const title = req.query.title;

    // Fetch the product details based on the ID
    const product = await Products.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated
    const user = req.isAuthenticated() ? req.user : null;

    // Get user role if user is authenticated
    const role = user.role;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const manager = user && user.manager ? user.manager : false;

    // Render the apply page with the necessary data
    res.render('apply-admin', {
      user,
      greeting,
      product,
      pid: productId,
      location: location,
      title: title,
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



// Update Admin Applications record
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID of the record to be updated

    // Find the existing Applications record by ID and update its fields
    const updatedApplication = await Application.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the Applications record exists
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application record not found' });
    }

    // Respond with the updated Applications record
    res.status(200).render('success/update-application', { updatedApplication });
  } catch (error) {
    console.error('Error updating Applications record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// View applicant information
export const viewapplicantdetail = async (req, res) => {
  try {
     const apply = await Application.findOne({ _id: req.params.id });

    if (!apply) {
      return res.status(404).send("Application not found");
    }

    res.render("applicant-info", {
      apply
    });
  } catch (error) {
    console.log(error);
  }
};


// Apply for sponsorship form
export const applyForSponsorship = async (req, res) => {

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
    // Get the product ID and location from the query parameters
    const productId = req.query.pid;
    const location = req.query.location;
    const title = req.query.title;

    // Fetch the product details based on the ID
    const product = await Products.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated
    const user = req.isAuthenticated() ? req.user : null;

    const role = user ? user.role : null;

    // Render the apply page with the necessary data
    res.render('apply-sponsor', {
      user,
      greeting,
      product,
      pid: productId,
      location: location,
      title: title,
      role,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};



// adminApplyForSponsorship
export const adminApplyForSponsorship = async (req, res) => {

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
    // Get the product ID and location from the query parameters
    const productId = req.query.pid;
    const location = req.query.location;
    const title = req.query.title;

    // Fetch the product details based on the ID
    const product = await Products.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated
    const user = req.isAuthenticated() ? req.user : null;

    const role = user ? user.role : null;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    // Render the apply page with the necessary data
    res.render('apply-sponsor-admin', {
      user,
      greeting,
      product,
      pid: productId,
      location: location,
      title: title,
      role,
      sudo,
      accountant,
      manager,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Controller function to create a new boost
export const createBoost = async (req, res) => {
  try {
    // Extracting data from request body
    const { title, phone, location, applyAid, username, address, address2, createdBy, comments, payment, duration, expiration } = req.body;

    // Convert payment to boolean
    const paymentBoolean = typeof payment === 'string' ? payment.toLowerCase() === 'true' : Boolean(payment);

    // Create a new Boost object with form data
    const boostForm = new Boost({
      title,
      phone,
      location,
      username,
      applyAid,
      address,
      address2,
      createdBy,
      comments,
      payment: paymentBoolean,
      duration,
      expiration,
      // `createdAt` and `updatedAt` are automatically handled by Mongoose if timestamps are enabled
    });

    // Saving the boost-apartment to the database
    const savedBoost = await boostForm.save();

    // Emit a new Application notification to all connected clients (if needed)
    // io.emit('new-application', { createdBy: savedBoost.createdBy, applyAid: savedBoost.applyAid, location: savedBoost.location });

    // Sending a success response
    res.status(201).render('success/boost');
    console.log(savedBoost);
  } catch (error) {
    // Sending an error response
    res.status(400).json({ error: error.message });
  }
};



// Get all boost
export const getAllBoost = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Boost.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    // Fetch all users from the database
    // const users = await User.find({}, '-password'); // Exclude password field from the response
    const boost = await Boost.aggregate([
      // Stage 1: Exclude password field from the response
      { $project: { password: 0 } },
      // Stage 2: Skip and limit
      { $skip: skip },
      { $limit: limit }
  ]);
  
    res.render('all-boost', { 
      boost: boost, 
      currentPage: page, 
      totalPages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching users.');
  }
};



// Get edit boost
export const editboost = async (req, res) => {
  const locals = {
    title: "Edit boost",
    description: "This is the edit boost page.",
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
    const boost = await Boost.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    const user = req.isAuthenticated() ? req.user : null;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const accountant = user && user.accountant ? user.accountant : false;
   

    res.render("edit-boost", {
      locals,
      boost,
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


// Update Admin Boosts record
export const updateboost = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID of the record to be updated

    // Find the existing Boosts record by ID and update its fields
    const updatedBoost = await Boost.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the Boosts record exists
    if (!updatedBoost) {
      return res.status(404).json({ message: 'Boost record not found' });
    }

    // Respond with the updated Boosts record
    res.status(200).render('success/update-boost', { updatedBoost });
  } catch (error) {
    console.error('Error updating Boosts record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete boost data
export const deleteboost = async (req, res) => {
  try {
    await Boost.deleteOne({ _id: req.params.id });
    res.render("success/delete-boost");
  } catch (error) {
    console.log(error);
  }
};