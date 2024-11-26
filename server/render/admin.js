import Products from "../models/products.js";
import AgroNews from "../models/agroNews.js";
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




// AGROTECH NEWS CONTROLLERS

// Controller function to create a new agro news
export const createAgroNews = async (req, res) => {
  try {
    // Extracting data from request body
    const { title,  source, sourceLink, createdBy, hashtags, newsDetail } = req.body;

    // Create a new AgroNews object with form data
    const agroNewsForm = new AgroNews({
    title,
    source, 
    sourceLink,
    createdBy, 
    hashtags,
    newsDetail,
      createdAt: new Date(), // Assuming createdAt and updatedAt are Date objects
      updatedAt: new Date()
    });

    // Saving the Contacts to the database
    const savedAgroNews = await agroNewsForm.save();

    // Sending a success response
    res.status(201).render('success/agro-news')
    console.log(savedAgroNews);
  } catch (error) {
    // Sending an error response
    res.status(400).json({ error: error.message });
  }
};

// AGROTECH NEWS CONTROLLER - GET ALL NEWS
// Controller function to get all AgroTech news
export const agroNews = async (req, res) => {
  // Function to determine the time of day
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
    // Determine user information and role
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null;
    const isAdmin = role === 'admin';
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const manager = user && user.manager ? user.manager : false;

    // Fetch all AgroTech news from the database
    const newsList = await AgroNews.find().sort({ createdAt: -1 });

    // Determine the time of day
    const greeting = getTimeOfDay();

    // Render the appropriate page based on the role
    if (isAdmin) {
      res.render('agro-news-admin', {
        user,
        greeting,
        isAdmin,
        role,
        sudo,
        manager,
        accountant,
        alert: req.query.alert,
        newsList, // Pass the news list to the admin view
      });
    } else if (role === 'user') {
      res.render('agro-news', {
        user,
        greeting,
        role,
        isAdmin,
        sudo,
        manager,
        accountant,
        alert: req.query.alert,
        newsList, // Pass the news list to the user view
      });
    } else {
      // Handle other roles or unauthorized access
      res.status(403).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error fetching AgroTech news:', error);
    res.status(500).send('Internal Server Error');
  }
};



export const adminReadAllNews = async (req, res) => {
  try {
    // Determine user information and role
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null;
    const isAdmin = role === 'admin';
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const manager = user && user.manager ? user.manager : false;

    // Fetch all AgroTech news from the database
    const newsList = await AgroNews.find().sort({ createdAt: -1 });

      res.render('read-agro-news', {
        user,
        isAdmin,
        role,
        sudo,
        manager,
        accountant,
        alert: req.query.alert,
        newsList, // Pass the news list to the admin view
      });
  } catch (error) {
    console.error('Error fetching AgroTech news:', error);
    res.status(500).send('Internal Server Error');
  }
};




// Get admin contact form
export const getNewsForm = async (req, res) => {

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
    res.render('agronews-form', {
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


// Delete a news
export const deleteNews = async (req, res) => {
  try {
    // Extract the news ID from the request parameters
    const { id } = req.params;

    // Find the news by ID and delete it
    const deletedNews = await AgroNews.findByIdAndDelete(id);

    // Redirect to the admin news page with a success message
    res.redirect('/admin-read-all-news?alert=deleted');
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Update a news
// export const updateNews = async (req, res) => {
//   try {
//     // Extract the news ID from the request parameters
//     const { id } = req.params;

//     // Find the news by ID and update it
//     const updatedNews = await AgroNews.findByIdAndUpdate(id, req.body);

//     // Redirect to the admin news page with a success message
//     res.redirect('/admin-read-all-news?alert=updated');
//   } catch (error) {
//     console.error('Error updating news:', error);
//     res.status(500).send('Internal Server Error');
//   }
// };