import User from "../models/auth.js";
import Salaries from "../models/salaries.js";
import Staffs from "../models/staffs.js";

// Create a new staff
export const createNewStaffs = async (req, res) => {
    try {
      // Extracting data from request body
      const { 
        dateOfEmployment,
        staffName,
        position,
        phone,
        email,
        address,
        address2,
        status,
        createdBy,
        username,  
        comments } = req.body;
  
      // Create a new staffs object with form data
      const staffsForm = new Staffs({
        dateOfEmployment,
        staffName,
        position,
        phone,
        email,
        address,
        address2,
        status,
        createdBy,
        username,
        comments,
        createdAt: new Date(), // Assuming createdAt and updatedAt are Date objects
        updatedAt: new Date()
      });
  
      // Saving the staffs to the database
      const savedStaffs = await staffsForm.save();
  
      // Sending a success response
      res.status(201).render('success/staffs')
      console.log(savedStaffs);
    } catch (error) {
      // Sending an error response
      res.status(400).json({ error: error.message });
    }
  };


// Create a new staff salary
export const createNewSalaries = async (req, res) => {
    try {
      // Extracting data from request body
      const { 
        date,
        staffName,
        position,
        salaries,
        salaryMonth,
        approvedBy,
        createdBy,
        username,  
        comments } = req.body;
  
      // Create a new salaries object with form data
      const salariesForm = new Salaries({
        date,
        staffName,
        position,
        salaries,
        salaryMonth,
        approvedBy,
        createdBy,
        username,
        comments,
        createdAt: new Date(), // Assuming createdAt and updatedAt are Date objects
        updatedAt: new Date()
      });
  
      // Saving the salaries to the database
      const savedSalaries = await salariesForm.save();
  
      // Sending a success response
      res.status(201).render('success/salaries')
      console.log(savedSalaries);
    } catch (error) {
      // Sending an error response
      res.status(400).json({ error: error.message });
    }
  };

// Render the staffs page
  export const addStaffsForm = async (req, res) => {

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

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const sudo = user && user.sudo ? user.sudo : false;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const role = user ? user.role : null; // Get user role if user is authenticated

  
      // Render the apply page with the necessary data
      res.render('add-staffs-form', {
        user,
        greeting,
        sudo,
        role,
        accountant,
        manager
      });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

// Render the salaries page
  export const addSalariesForm = async (req, res) => {

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
    // Fetch all staffs name
      const staffNames = await Staffs.distinct('staffName');

    // Fetch all positions
    const positions = await Staffs.distinct('position')  
  
      // Determine the time of the day
      const greeting = getTimeOfDay();
  
      // Check if the user is authenticated
      const user = req.isAuthenticated() ? req.user : null;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const sudo = user && user.sudo ? user.sudo : false;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const role = user ? user.role : null; // Get user role if user is authenticated
  
    // Render the apply page with the necessary data
    res.render('add-salary-form', {
        user,
        greeting,
        staffNames,
        positions,
        sudo,
        accountant,
        manager,
        role,
        alert: req.query.alert, // Pass the alert message
      });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  // Get All Staffs Controller
export const getAllStaffs = async (req, res) => {

    try {
      const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
      const limit = 15; // Number of entries per page
      const skip = (page - 1) * limit;
  
      // Fetch all storage data
      const totalEntries = await Staffs.countDocuments();
  
      const totalPages = Math.ceil(totalEntries / limit);
  
      // Fetch all users from the database
      // const users = await User.find({}, '-password'); // Exclude password field from the response
      const staffs = await Staffs.aggregate([
        { $skip: skip },
        { $limit: limit }
    ]);
    
      res.render('staffs-list', { 
        staffs: staffs, 
        currentPage: page, 
        totalPages: totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
    }
  };

  // Get All Salaries Controller
export const getAllSalaries = async (req, res) => {

    try {
      const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
      const limit = 15; // Number of entries per page
      const skip = (page - 1) * limit;
  
      // Fetch all storage data
      // const allStorage = await User.find().skip(skip).limit(limit);
      const totalEntries = await Salaries.countDocuments();
  
      const totalPages = Math.ceil(totalEntries / limit);
  
      // Fetch all users from the database
      // const users = await User.find({}, '-password'); // Exclude password field from the response
      const salaries = await Salaries.aggregate([
        { $skip: skip },
        { $limit: limit }
    ]);
    
      res.render('salaries-list', { 
        salaries: salaries, 
        currentPage: page, 
        totalPages: totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
    }
  };

  // Delete application data
export const deleteStaffs = async (req, res) => {
  try {
    await Staffs.deleteOne({ _id: req.params.id });
    res.render("success/delete-staffs");
  } catch (error) {
    console.log(error);
  }
};

// Delete application data
export const deleteSalaries = async (req, res) => {
  try {
    await Salaries.deleteOne({ _id: req.params.id });
    res.render("success/delete-salaries");
  } catch (error) {
    console.log(error);
  }
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

// GET route handler for rendering the edit staff page
export const editstaff = async (req, res) => {
  try {
    // Find the staff member by _id
    const staffs = await Staffs.findOne({ _id: req.params.id });

    // Determine the time of the day for greeting
    const greeting = getTimeOfDay();

    // Fetch authenticated user data from request (assuming it's set by middleware)
    const user = req.isAuthenticated() ? req.user : null;

    // Fetch additional user permissions or roles
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const role = user.role;

    // Render the edit-staff template with retrieved data
    res.render("edit-staff", {
      staffs,
      greeting,
      user,
      sudo,
      role,
      accountant,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    // Handle errors gracefully
    console.error(error.message);
    res.status(404).send("User not found");
  }
};



// Update user data #Sudo Admin PATCH
export const updatestaff = async (req, res) => {
  try {
    // Extract the User ID from the request parameters
    const { id } = req.params;

    // Find the User record by ID and update its fields
    const updatedStaffs = await Staffs.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the User record exists
    if (!updatedStaffs) {
      return res.status(404).json({ message: 'Staff record not found' });
    }

    // Respond with the updated User record
    // res.status(200).json(updatedStorage);
    res.render('success/update-staffs');
  } catch (error) {
    console.error('Error updating User record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const viewstaff = async (req, res) => {
  try {
    const staff = await Staffs.findOne({ _id: req.params.id });

    res.render("view-staff", {
      staff,
    });
  } catch (error) {
    console.log(error);
  }
};