import Products from "../models/products.js";
import User from "../models/auth.js";
import moment from "moment";


// Admin
 // About Page
export const adminAbout = async (req, res) => {
  
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
  
       // Determine the time of the day
      const greeting = getTimeOfDay();

        // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const sudo = user && user.sudo ? user.sudo : false;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;
  
      // Render the index page with the receptions and latestStorage data
      res.render('admin-about', { user, greeting, sudo, accountant, role, manager, alert: req.query.alert });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  // Features Page
export const adminFeatures = async (req, res) => {
    const locals = {
      title: "Home Page",
      description: "This is the home page of the System.",
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
      const user = req.isAuthenticated() ? req.user : null;
      const role = user ? user.role : null; // Get user role if user is authenticated
  
       // Determine the time of the day
      const greeting = getTimeOfDay();

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const sudo = user && user.sudo ? user.sudo : false;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;
  
      // Render the index page with the receptions and latestStorage data
      res.render('admin-features', { locals, user, greeting, sudo, accountant, role, manager,
        alert: req.query.alert, // Pass the alert message
       });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

// Controller function to render guest page
export const adminBlog = async (req, res) => {
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
    const apts = await Products.findOne({ _id: req.params.id });
    const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated

    products.forEach(product => {
      // Display the first photo in the 'photos' array if available, otherwise use an empty string
      product.photoUrl = product.photos && product.photos.length > 0 ? product.photos[0] : ''; 
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });


    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const greeting = getTimeOfDay();
    res.render('admin-blog', { greeting, apts, user, products, sudo, accountant, role, manager,
      alert: req.query.alert, // Pass the alert message
     });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// service Page
export const adminService = async (req, res) => {
    const locals = {
      title: "Home Page",
      description: "This is the home page of the System.",
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
      const user = req.isAuthenticated() ? req.user : null;
      const role = user ? user.role : null; // Get user role if user is authenticated

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;
  
    // Determine the time of the day
    const greeting = getTimeOfDay();
  
    // Render the index page with the receptions and latestStorage data
      res.render('admin-service', { locals, user, greeting, sudo, accountant, role, manager,
        alert: req.query.alert, // Pass the alert message
       });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };


// Terms and Conditions
export const termsConditions = async (req, res) => {

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

    const user = req.isAuthenticated() ? req.user : null;

    const role = user ? user.role : null; // Get user role if user is authenticated

    res.render("terms-conditions", {
      greeting,
      user,
      role
    });
  } catch (error) {
    // Handle errors gracefully
    console.error(error.message);
    res.status(404).send("Page not found");
  }
};

// registration process statement
export const registrationProcessStatement = (req, res) => {
  res.render("registration-process-statement")
}