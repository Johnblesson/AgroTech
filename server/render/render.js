import Products from "../models/products.js";
import User from "../models/auth.js";
import moment from "moment";
import PageViews from "../models/pageViews.js";
import IPAddress from "../models/ipaddress.js";
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

    const products = await Products.find({ 
      verification: 'verified', 
      status: { $in: ['Sell', 'Lease'] } 
    }).sort({ sponsored: -1, createdAt: -1 });

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
      product.photoUrl = product.photo || '';
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
    const products = await Products.find({ 
      verification: 'verified', 
      status: { $in: ['Sell', 'Lease'] } 
    }).sort({ sponsored: -1, createdAt: -1 });

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

    // Process each product to set photoUrl, formattedCreatedAt, and daysAgo
    products.forEach(product => {
      product.photoUrl = product.photo || '';
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


// Display all products for admin
// export const allAdminProducts = async (req, res) => {
//   const getTimeOfDay = () => {
//     const currentHour = new Date().getHours();
//     if (currentHour >= 5 && currentHour < 12) return 'Good Morning';
//     if (currentHour >= 12 && currentHour < 18) return 'Good Afternoon';
//     return 'Good Evening';
//   };

//   try {
//     // Fetch product by ID if needed and all verified products
//     const apts = await Products.findOne({ _id: req.params.id });
//     const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
//     const greeting = getTimeOfDay();
//     const user = req.isAuthenticated() ? req.user : null;
//     const role = user ? user.role : null;
//     const sudo = user?.sudo || false;
//     const accountant = user?.accountant || false;
//     const manager = user?.manager || false;

//     products.forEach(product => {
//       product.photoUrl = product.photo || ''; // Default to empty if no photo
//       product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
//       product.daysAgo = moment().diff(moment(product.createdAt), 'days');
//     });

//     res.render("all-admin-products", {
//       products,
//       greeting,
//       user,
//       apts,
//       sudo,
//       accountant,
//       role,
//       manager,
//       alert: req.query.alert,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("An error occurred while fetching products.");
//   }
// };


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
      if (!product.photo) {
        product.photoUrl = ''; // Initialize an empty string if no photo is available
      } else {
        product.photoUrl = product.photo; // Set photoUrl to the value of photo
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
    // Find all verified apartments and sort them by sponsored status and createdAt timestamp in descending order
    const apartments = await Apartments.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    // Process each apartment to set photoUrl, formattedCreatedAt, and daysAgo
    apartments.forEach(apartment => {
      // Ensure photoUrl is set properly to the first photo if it's an array
      if (Array.isArray(apartment.photo) && apartment.photo.length > 0) {
        apartment.photoUrl = apartment.photo[0];
      } else {
        apartment.photoUrl = apartment.photo || ''; // Use empty string if no photo is available
      }
    });
      const user = req.isAuthenticated() ? req.user : null;
      const role = user ? user.role : null; // Get user role if user is authenticated

  
       // Determine the time of the day
      const greeting = getTimeOfDay();
  
      // Render the index page with the receptions and latestStorage data
      res.render('about', { locals, user, greeting, apartments, role, alert: req.query.alert });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };


// Features Page
export const features = async (req, res) => {
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
      res.render('features', { locals, user, greeting, role, alert: req.query.alert });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

// Blog Page
export const blog = async (req, res) => {
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
    // Fetch all verified products from the database
    const products = await Products.find({ verification: 'verified' });

    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated

    // Process each product to set photoUrl, formattedCreatedAt, and daysAgo
    products.forEach(product => {
      // Ensure photoUrl is set properly
      product.photoUrl = product.photo || ''; // Use empty string if no photo is available
    });

    const greeting = getTimeOfDay();

    res.render("index-admin", { // Assuming your main admin page is index-admin.ejs
      products,
      greeting,
      user,
      role,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
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
import { getName } from 'country-list';

export const guestPage = async (req, res) => {
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

  // Get the real IP address (use Cloudflare's IP header if behind a proxy)
  const ip =
    req.headers['cf-connecting-ip'] ||  // For Cloudflare users
    req.headers['x-forwarded-for']?.split(',')[0] ||  // For proxies, split in case of multiple IPs
    req.connection.remoteAddress ||
    req.socket.remoteAddress || '';

  const timestamp = new Date().toISOString();
  console.log('ip address:', ip, '/guestpage', timestamp);

  // Don't log localhost IPs
  if (ip === '127.0.0.1' || ip === '::1') {
    console.log('Localhost IP detected, skipping logging.');
    return res.render('guest-page', { greeting: getTimeOfDay() });
  }

  const API_KEY = 'dc750824f1d744';  // Replace with your IPinfo API key

  try {
    // Fetch location data from IPinfo
    const geoData = await axios.get(`https://ipinfo.io/${ip}?token=${API_KEY}`);
    const countryCode = geoData.data.country || 'Unknown';
    const city = geoData.data.city || 'Unknown';
    const region = geoData.data.region || 'Unknown';
    const postal = geoData.data.postal || 'Unknown';
    const loc = geoData.data.loc || 'Unknown';  // Format: "latitude,longitude"
    const org = geoData.data.org || 'Unknown';
    const timezone = geoData.data.timezone || 'Unknown';
    const hostname = geoData.data.hostname || 'Unknown';

    // Get full country name using the library
    const countryName = getName(countryCode) || 'Unknown';

    console.log(
      'Country:', countryCode,
      'Country name:', countryName,
      'City:', city,
      'Region:', region,
      'Postal:', postal,
      'Loc:', loc,
      'Org:', org,
      'Timezone:', timezone,
      'Hostname:', hostname
    );

    // Check if the IP was already logged within the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const existingLog = await IPAddress.findOne({
      ip: ip,
      timestamp: { $gte: oneDayAgo.toISOString() }
    });

    if (!existingLog) {
      // Log IP if it hasn't been logged in the past 24 hours
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
      console.log('IP, country, and city logged:', ip, countryName, city, region, postal, loc, org, timezone);
    } else {
      console.log('IP already logged within 24 hours:', ip);
    }

    // Increment the view count for the guest page
    const pageView = await PageViews.findOneAndUpdate(
      { page: 'guestPage' },
      { $inc: { views: 1 } },
      { upsert: true, new: true }
    );

    const apts = await Apartments.findOne({ _id: req.params.id });
    // const apartments = await Apartments.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
    const apartments = await Apartments.find({ 
      verification: 'verified', 
      // status: 'Sell' 
      status: { $in: ['Sell', 'Lease', 'Rent'] } 
    }).sort({ sponsored: -1, createdAt: -1 });

    const user = req.isAuthenticated() ? req.user : null;

    apartments.forEach(apartment => {
      apartment.photoUrl = apartment.photo || '';
      apartment.formattedCreatedAt = moment(apartment.createdAt).format('DD-MM-YYYY HH:mm');
      apartment.daysAgo = moment().diff(moment(apartment.createdAt), 'days');
    });

    const greeting = getTimeOfDay();
    const views = pageView.views; // Get the view count

    res.render('guest-page', { greeting, apts, user, apartments, views });
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
      // apartments,
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