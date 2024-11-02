import Agents from '../models/agents.js'; // Importing the Agents model
import User from '../models/auth.js'; // Importing the User model
import flash from 'connect-flash'; // Make sure to import connect-flash

// Controller function to create a new Agent
// POST /agents
export const createAgentForm = async (req, res) => {
    try {
        // Extracting data from request body
        const { fullname, phone, email, username, address, address2, createdBy, comments } = req.body;

        // Phone number validation: must be 8 digits and start with 31, 32, or 34
        const phonePattern = /^(31|32|34)\d{6}$/; // Regex to match Qcell number format
        const userRole = req.isAuthenticated() && req.user ? req.user.role : null;

        // Redirect path based on role
        const redirectPath = userRole === 'admin' ? 'agents-admin' : 'agents';

        if (!phonePattern.test(phone)) {
            // If the phone number does not match the pattern, send a flash message and redirect
            req.flash('error', 'Your number is not a Qcell number.');
            return res.status(400).redirect(redirectPath);
        }

        // Create a new Agents object with form data
        const agentsForm = new Agents({
            fullname, 
            phone, 
            email,  
            username, 
            address, 
            address2, 
            createdBy, 
            comments,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Saving the Agents to the database
        const savedAgents = await agentsForm.save();
        
        // Sending a success response
        res.status(201).render('success/agents');
        console.log(savedAgents);
    } catch (error) {
        // Sending an error response
        req.flash('error', error.message); // Flash error message for other errors
        const userRole = req.isAuthenticated() && req.user ? req.user.role : null;
        const redirectPath = userRole === 'admin' ? 'agents-admin' : 'agents';
        return res.status(400).redirect(redirectPath);
    }
};


  // Get agent form
  // GET /agents

export const agentForm = async (req, res) => {

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

       // Pass flash messages
       const messages = {
        error: req.flash('error'), // Get error messages
        success: req.flash('success') // You can also include success messages if needed
      };
  
      // Render the apply page with the necessary data
      res.render('apply-agent-form', {
        user,
        greeting,
        role,
        alert: req.query.alert, // Pass the alert message
        messages // Pass flash messages to the template
      });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  // GET /agents

export const agentFormAdmin = async (req, res) => {

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
    res.render('apply-agent-form-admin', {
      user,
      greeting,
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

// Get All Agents Controller
export const agentProgram = async (req, res) => {

    try {
      // const user = req.isAuthenticated() ? req.user : null;

      const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
      const limit = 15; // Number of entries per page
      const skip = (page - 1) * limit;
  
      // Fetch all storage data
      const totalEntries = await Agents.countDocuments();
      const totalPages = Math.ceil(totalEntries / limit);
  
      // Fetch all users from the database
      const agent = await Agents.aggregate([
        // Stage 1: Exclude password field from the response
        { $project: { password: 0 } },
        // Stage 2: Skip and limit
        { $skip: skip },
        { $limit: limit }
    ]);
    
      res.render('agent-program', { 
        agent: agent, 
        currentPage: page, 
        totalPages: totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
    }
  };


