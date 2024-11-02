import Products from "../models/products.js";
import User from "../models/auth.js";
import moment from "moment";
import PageViews from "../models/pageViews.js";
import IPAddress from "../models/ipaddress.js";
import { getName } from 'country-list';
// import { checkUserMessages } from '../controllers/contact.js'
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()

// Render the index page route for users 
export const homeRoute = async (req, res) => {
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
    const usersCount = await User.countDocuments();

    const apts = await Products.findOne({ _id: req.params.id });

    const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    const greeting = getTimeOfDay();
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null;

    let unreadCount = 0;
    if (user) {
      const userWithMessages = await User.findById(user._id).populate({
        path: 'messages.senderId',
        select: 'fullname username',
      });
      unreadCount = userWithMessages.messages.filter(message => !message.read).length;
    }

    products.forEach(product => {
      // Display the first photo in the 'photos' array if available, otherwise use an empty string
      product.photoUrl = product.photos && product.photos.length > 0 ? product.photos[0] : ''; 
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

    // Pass req.query.alert to the view
    res.render("index", {
      products,
      greeting,
      user,
      apts,
      role,
      usersCount,
      unreadCount,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
  }
};


// Render the index page route for admin
export const adminHomeRoute = async (req, res) => {
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

    const greeting = getTimeOfDay();
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated

    
    let unreadCount = 0;
    if (user) {
      const userWithMessages = await User.findById(user._id).populate({
        path: 'messages.senderId',
        select: 'fullname username',
      });
      unreadCount = userWithMessages.messages.filter(message => !message.read).length;
    }

    products.forEach(product => {
      // Display the first photo in the 'photos' array if available, otherwise use an empty string
      product.photoUrl = product.photos && product.photos.length > 0 ? product.photos[0] : ''; 
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

    // Fetch user data from the session or request object
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const manager = user && user.manager ? user.manager : false;

    res.render("index-admin", {
      products,
      greeting,
      user,
      role,
      apts,
      sudo,
      accountant,
      manager,
      unreadCount,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
  }
};



// Post Apartment
export const getPostProduct = async (req, res) => {
 
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

    // Render the index page
    res.render('post-product', { user, greeting, role, alert: req.query.alert });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Post Apartment Admin
export const getPostProductAdmin = async (req, res) => {

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

    res.render('post-product-admin', { user, greeting, sudo, accountant, role, manager, alert: req.query.alert });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};



export const allAdminProducts = async (req, res) => {
  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return 'Good Morning';
    if (currentHour >= 12 && currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  try {
    // Fetch product by ID if needed and all verified products
    const apts = await Products.findOne({ _id: req.params.id });
    const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
    const greeting = getTimeOfDay();
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null;
    const sudo = user?.sudo || false;
    const accountant = user?.accountant || false;
    const manager = user?.manager || false;

    products.forEach(product => {
      // Display the first photo in the 'photos' array if available, otherwise use an empty string
      product.photoUrl = product.photos && product.photos.length > 0 ? product.photos[0] : ''; 
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

    res.render("all-admin-products", {
      products,
      greeting,
      user,
      apts,
      sudo,
      accountant,
      role,
      manager,
      alert: req.query.alert,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
  }
};


  
// Display all products for farmers
export const allVirtualProducts = async (req, res) => {
  
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
    const apts = await Products.findOne({ _id: req.params.id });
    // Find all verified products and sort them by sponsored status and createdAt timestamp in descending order
    const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated

    const product = await Products.find();

    // Ensure photoUrl is set properly for each product
    products.forEach(product => {
      if (!product.photos || product.photos.length === 0) {
        product.photoUrl = ''; // Initialize an empty string if no photos are available
      } else {
        product.photoUrl = product.photos[0]; // Set photoUrl to the first photo in the photos array
      }
    });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Render the index page with the receptions and latestStorage data
    res.render('all-virtual-products', { product, greeting, user, products, role, alert: req.query.alert });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};




// About Page
export const about = async (req, res) => {
  
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
      // Find all verified products and sort them by sponsored status and createdAt timestamp in descending order
      const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

      const user = req.isAuthenticated() ? req.user : null;
      const role = user ? user.role : null; // Get user role if user is authenticated

  
       // Determine the time of the day
      const greeting = getTimeOfDay();
  
      // Render the index page with the receptions and latestStorage data
      res.render('about', { user, greeting, products, role, alert: req.query.alert });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };


// Features Page
export const features = async (req, res) => {
  
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
  
      // Render the index page with the receptions and latestStorage data
      res.render('features', { user, greeting, role, alert: req.query.alert });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

// Blog Page
 // Display all products for farmers
 export const blog = async (req, res) => {
    
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
    const apts = await Products.findOne({ _id: req.params.id });
    // Find all verified products and sort them by sponsored status and createdAt timestamp in descending order
    const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated
     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const sudo = user && user.sudo ? user.sudo : false;

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const accountant = user && user.accountant ? user.accountant : false;
 
     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const manager = user && user.manager ? user.manager : false;

    const product = await Products.find();

    products.forEach(product => {
      // Display the first photo in the 'photos' array if available, otherwise use an empty string
      product.photoUrl = product.photos && product.photos.length > 0 ? product.photos[0] : ''; 
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

     // Determine the time of the day
    const greeting = getTimeOfDay();

    // Render the index page with the receptions and latestStorage data
    res.render('blog', { product, greeting, user, products, role, sudo, accountant, manager, alert: req.query.alert });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};


// service Page
export const service = async (req, res) => {
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
  
      // Render the index page with the receptions and latestStorage data
      res.render('service', { locals, user, greeting, role, alert: req.query.alert });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

// Agro News Page
export const agroNews = async (req, res) => {
  
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
    // Fetch user data from the session or request object
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const manager = user && user.manager ? user.manager : false;

     // Determine the time of the day
    const greeting = getTimeOfDay();

    // Render the index page with the receptions and latestStorage data
    // res.render('agro-news', { user, greeting, role, alert: req.query.alert });
    if (role === 'admin') {
      res.render('agro-news-admin', { user, greeting, role, sudo, manager, accountant, alert: req.query.alert });
    } 
    else if (role === 'user') {
      res.render('agro-news', { user, greeting, role, sudo, manager, accountant, alert: req.query.alert });
    }
     else {
      // Handle other roles or unauthorized access
      res.status(403).send('Unauthorized');
    }
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Farming Tips Page
export const farmingTips = async (req, res) => {
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
    const role = user ? user.role : null;
    const isAdmin = role === 'admin'; // Define isAdmin based on the role
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const manager = user && user.manager ? user.manager : false;

    const greeting = getTimeOfDay();

    res.render('farming-tips', {
      user,
      greeting,
      role,
      sudo,
      accountant,
      manager,
      isAdmin, // Pass isAdmin to the template
      alert: req.query.alert,
    });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};



// Weather Update Page
export const weatherUpdate = async (req, res) => {
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
    const role = user ? user.role : null;
    const isAdmin = role === 'admin'; // Define isAdmin based on the role
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const manager = user && user.manager ? user.manager : false;

    const greeting = getTimeOfDay();

    res.render('weather-update', {
      user,
      greeting,
      role,
      sudo,
      accountant,
      manager,
      isAdmin, // Pass isAdmin to the template
      alert: req.query.alert,
    });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};


// User Page
export const allusers = async (req, res) => {
  const locals = {
    title: "Home Page",
    description: "This is the home page of the System.",
  }

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

    // Render the index page with the receptions and latestStorage data
    res.render('all-users', { locals, user, greeting, role });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Controller function to render guest page
export const guestPage = async (req, res) => {
  // Function to get greeting based on the time of day
  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return 'Good Morning';
    if (currentHour >= 12 && currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get client IP address
  const getClientIp = () => 
    req.headers['cf-connecting-ip'] ||  // For Cloudflare
    req.headers['x-forwarded-for']?.split(',')[0] ||  // For proxies
    req.connection.remoteAddress ||
    req.socket.remoteAddress || '';

  const ip = getClientIp();
  const timestamp = new Date().toISOString();
  console.log('IP address:', ip, '/guest-page', timestamp);

  // Don't log localhost IPs
  if (ip === '127.0.0.1' || ip === '::1') {
    console.log('Localhost IP detected, skipping logging.');
    return res.render('guest-page', { greeting: getTimeOfDay(), products: [] });
  }

  const API_KEY = 'dc750824f1d744';  // Replace with your IPinfo API key

  try {
    // Fetch location data from IPinfo API
    const geoData = await axios.get(`https://ipinfo.io/${ip}?token=${API_KEY}`);
    const {
      country: countryCode = 'Unknown',
      city = 'Unknown',
      region = 'Unknown',
      postal = 'Unknown',
      loc = 'Unknown',  // Latitude, Longitude
      org = 'Unknown',
      timezone = 'Unknown',
      hostname = 'Unknown'
    } = geoData.data;

    // Get full country name
    const countryName = getName(countryCode) || 'Unknown';

    console.log('IP Information:', {
      Country: countryCode,
      CountryName: countryName,
      City: city,
      Region: region,
      Postal: postal,
      Loc: loc,
      Org: org,
      Timezone: timezone,
      Hostname: hostname
    });

    // Check if IP has been logged within the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const existingLog = await IPAddress.findOne({
      ip,
      timestamp: { $gte: oneDayAgo.toISOString() }
    });

    // Log IP if not logged in the past 24 hours
    if (!existingLog) {
      await IPAddress.create({
        ip,
        country: countryCode,
        countryName,
        city,
        region,
        postal,
        loc,
        org,
        timezone,
        timestamp,
        hostname
      });
      console.log('IP and location logged:', { ip, countryName, city });
    } else {
      console.log('IP already logged within the last 24 hours:', ip);
    }

    // Increment guest page view count
    const pageView = await PageViews.findOneAndUpdate(
      { page: 'guestPage' },
      { $inc: { views: 1 } },
      { upsert: true, new: true }
    );

    // Fetch verified products
    const products = await Products.find({ verification: 'verified' })
      .sort({ sponsored: -1, createdAt: -1 })
      .lean(); // Use lean for better performance

    // Ensure photo URLs and additional properties are available
    products.forEach(product => {
      product.photoUrl = product.photos?.[0] || ''; 
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

    // Greeting based on time of day
    const greeting = getTimeOfDay();
    const views = pageView?.views || 0;  // Safe access for views

    res.render('guest-page', { greeting, products, views });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Controller for view ip address
export const viewIPAddresses = async (req, res) => {
  try {
    // Get page number from query parameters, default to 1
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 80; // Number of items per page
    const skip = (page - 1) * limit; // Calculate skip value for pagination

    // Fetch IP addresses with pagination
    const [ipAddresses, total] = await Promise.all([
      IPAddress.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      IPAddress.countDocuments()
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);


    const countryFrequency = await getCountryFrequency();

    // Prepare data for the pie chart
    const labels = countryFrequency.map(item => item._id);
    const data = countryFrequency.map(item => item.count);

    // Render the 'visitors-ip' EJS view and pass the data including pagination info
    res.render('visitors-ip', { 
      ipAddresses,
      currentPage: page,
      totalPages,
      labels,
      data
    });
  } catch (error) {
    console.error('Error fetching IP addresses:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Get top % countries
const getCountryFrequency = async () => {
  // Aggregate IP logs to count occurrences of each country
  const countryFrequency = await IPAddress.aggregate([
    {
      $group: {
        _id: '$countryName',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5 // Get the top 5 countries
    }
  ]);

  return countryFrequency;
};



// Controller function for ip metrics
export const ipMetrics = async (req, res) => {
  try {
    const ipAddresses = await IPAddress.find().sort({ timestamp: -1 });
    const countryFrequency = await getCountryFrequency();

    // Prepare data for the pie chart
    const labels = countryFrequency.map(item => item._id);
    const data = countryFrequency.map(item => item.count);
    res.render('metrics', { ipAddresses, labels, data });
  } catch (error) {
    console.error('Error fetching IP addresses:', error);
    res.status(500).send('Internal Server Error');
  }
}; 

// View visitors IP Address with pagination
export const viewIPCities = async (req, res) => {
  try {
    // Get page number from query parameters, default to 1
    const page = parseInt(req.query.page, 15) || 1;
    const limit = 15; // Number of items per page
    const skip = (page - 1) * limit; // Calculate skip value for pagination

    // Fetch IP addresses with pagination
    const [ipAddresses, total] = await Promise.all([
      IPAddress.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      IPAddress.countDocuments()
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Render the 'visitors-ip' EJS view and pass the data including pagination info
    res.render('visitors-cities', { 
      ipAddresses,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching IP addresses:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Controller function to delete an IP address by ID
export const deleteIPAddress = async (req, res) => {
  try {
    const { id } = req.params; // Get IP address ID from route parameters
    await IPAddress.findByIdAndDelete(id); // Delete the IP address
    res.redirect('/view-ip-addresses'); // Redirect to the IP addresses page
  } catch (error) {
    console.error('Error deleting IP address:', error);
    res.status(500).send('Internal Server Error');
  }
};

// view ip address details
export const viewipaddressdetails = async (req, res) => {
  try {
     const ipaddress = await IPAddress.findOne({ _id: req.params.id });

    if (!ipaddress) {
      return res.status(404).send("IP Address not found");
    }
  
    res.render("ip-detail", {
      ipaddress
    });
  } catch (error) {
    console.log(error);
  }
};

// Render the pie-chart page
export const pieChartPage = async (req, res) => {
  try {
    const countryFrequency = await getCountryFrequency();

    // Prepare data for the pie chart
    const labels = countryFrequency.map(item => item._id);
    const data = countryFrequency.map(item => item.count);

    res.render('pie-chart', { labels, data });
  } catch (error) {
    console.error('Error generating pie chart data:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Controller function to fetch country metrics and render the page
export const renderCountryMetricsPage = async (req, res) => {
  try {
    // Fetch all IP records
    const ipAddresses = await IPAddress.find({});

    // Calculate the total number of visits from each country
    const countryMetrics = ipAddresses.reduce((acc, ip) => {
      const countryName = ip.countryName || 'Unknown';
      if (!acc[countryName]) {
        acc[countryName] = 1;
      } else {
        acc[countryName]++;
      }
      return acc;
    }, {});

    // Convert the object to an array of objects for easier handling in the EJS template
    const countryMetricsArray = Object.entries(countryMetrics).map(([country, count]) => ({ country, count }));

    // Calculate the total number of visits
    const totalVisits = countryMetricsArray.reduce((sum, metric) => sum + metric.count, 0);

    // Render the EJS page and pass the country metrics and total visits
    res.render('country-metrics', { countryMetrics: countryMetricsArray, totalVisits });
  } catch (error) {
    console.error('Error fetching country metrics:', error);
    res.status(500).send('Internal Server Error');
  }
}


// faq Page
export const faq = async (req, res) => {
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
    const greeting = getTimeOfDay();
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated

    res.render("faq", {
      // products,
      greeting,
      user,
      // apts,
      role,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching apartments.");
  }
};


// faq Page
export const faqAdmin = async (req, res) => {
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
    const greeting = getTimeOfDay();
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    res.render("faq-admin", {
      accountant,
      greeting,
      user,
      sudo,
      role,
      manager,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching apartments.");
  }
};


// Controller function to render the agent page
 export const agentController = async (req, res) => {
  const locals = {
    title: "About Page",
    description: "This is the about page of the System.",
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

    // Render the index page with the receptions and latestStorage data
    res.render('agent-page', { locals, user, greeting, role, alert: req.query.alert });
  } catch (error) {
    console.error('Error rendering the page:', error);
    res.status(500).send('Internal Server Error');
  }
};
