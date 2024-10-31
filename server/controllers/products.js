import Products from '../models/products.js';
import User from '../models/auth.js';
import Notification from '../models/notification.js';
import moment from 'moment';
import mongoose from 'mongoose';
import { io } from '../../server.js'; // Import the io instance

// Controller function to create a new product
export const createProduct = async (req, res) => {
  try {
    // Check if all three required files are uploaded
    if (!req.files || !req.files.photo || !req.files.photo[0] || !req.files.photo1 || !req.files.photo1[0] || !req.files.photo2 || !req.files.photo2[0]) {
      return res.status(400).json({ error: 'All three photos are required' });
    }

    const photo = req.files.photo[0];
    const photo1 = req.files.photo1[0];
    const photo2 = req.files.photo2[0];

    // Check if files contain the S3 locations
    if (!photo.location || !photo1.location || !photo2.location) {
      return res.status(400).json({ error: 'File locations not found' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    // Create a new Products object with form data and S3 URLs
    const productData = new Products({
      pid: req.body.pid,
      title: req.body.title,
      location: req.body.location,
      price: req.body.price,
      currency: req.body.currency, 
      typeOfProduct: req.body.typeOfProduct,
      description: req.body.description,
      photos: [photo.location, photo1.location, photo2.location], // Store as an array of S3 URLs
      phone: req.body.phone,
      region: req.body.region,
      negotiation: req.body.negotiation,
      availability: req.body.availability,
      verification: req.body.verification,
      sponsored: req.body.sponsored,
      createdBy: user._id,
      role: user.role,
      clicks: req.body.clicks,
      user: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the product to the database
    const savedProduct = await productData.save();

    // Create and save the notification
    const notification = new Notification({
      title: savedProduct.title,
      location: savedProduct.location,
      createdBy: savedProduct.createdBy,
    });

    await notification.save();

    // Emit a new product notification to all connected clients
    io.emit('new-product', { title: savedProduct.title, location: savedProduct.location, createdBy: savedProduct.createdBy });

    // Redirect based on user role
    const redirectUrl = user.role === 'admin' ? '/admin-product-success' : '/product-success';
    res.redirect(redirectUrl);

    console.log('Product created successfully:', savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: error.message });
  }
};



// Controller function to get all Products notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }); // Get latest notifications first
    res.status(200).render('socket-io-notification', { notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id; // Get the notification ID from the request parameters

    // Find the notification by ID and delete it from the database
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    // If the notification does not exist, return an error
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Redirect back to the notifications page after deletion
    res.redirect('/notifications');
  } catch (error) {
    // Handle any errors that occur during deletion
    res.status(500).json({ error: error.message });
  }
};


// Controller function to get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!apartment) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to update an apartment by ID
export const updateProductById = async (req, res) => {
  try {
    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Controller function to delete an Pproduct by ID
export const deleteProductById = async (req, res) => {
  const productId = req.params.id;

  // Validate the ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).send({ error: 'Invalid product ID' });
  }

  try {
    const result = await Products.deleteOne({ _id: productId });
    if (result.deletedCount === 0) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.render("success/delete-product");
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
};



// Controller function to get all products on the table. Admin Dashboard
export const allProducts = async (req, res) => {
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
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Products.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    const users = await User.find();
    // Fetch all products from the database
    const products = await Products.find();

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated and get their ID
    const user = req.isAuthenticated() ? req.user : null;

    // Render the all-properties view template with the products data
    res.render("all-products", {
      products,
      greeting,
      user,
      users,
      currentPage: page, 
      totalPages: totalPages,
    });
  
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching apartments.");
  }
};

// Controller function to get sponsorsip
export const sponsorship = async (req, res) => {
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
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Apartments.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    const users = await User.find();
    // Fetch all apartments from the database
    const apartments = await Apartments.find();

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated and get their ID
    const user = req.isAuthenticated() ? req.user : null;

    // Render the all-properties view template with the apartments data
    res.render("sponsorship", {
      apartments,
      greeting,
      user,
      users,
      currentPage: page, 
      totalPages: totalPages,
    });
  
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching apartments.");
  }
};


// Controller function to get availability
export const availability = async (req, res) => {
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
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Products.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    const users = await User.find();
    // Fetch all products from the database
    const products = await Products.find();

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated and get their ID
    const user = req.isAuthenticated() ? req.user : null;

    // Render the all-properties view template with the products data
    res.render("availability", {
      products,
      greeting,
      user,
      users,
      currentPage: page, 
      totalPages: totalPages,
    });
  
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
  }
};


// Get
export const editproduct = async (req, res) => {

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
    const product = await Products.findOne({ _id: req.params.id });

     // Determine the time of the day
     const greeting = getTimeOfDay();

     const user = req.isAuthenticated() ? req.user : null;

    res.render("update-product", {
      product,
      greeting,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

// Get
export const updateAdminProducts = async (req, res) => {

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
    const product = await Products.findOne({ _id: req.params.id });

     // Determine the time of the day
     const greeting = getTimeOfDay();

     const user = req.isAuthenticated() ? req.user : null;

         // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
         const sudo = user && user.sudo ? user.sudo : false;

         // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
         const manager = user && user.manager ? user.manager : false;
     
         const accountant = user && user.accountant ? user.accountant : false;

    res.render("update-admin-product", {
      locals,
      product,
      greeting,
      user,
      manager,
      sudo,
      accountant,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.log(error);
  }
};

// Update Admin Aroducts record
export const productUpdate = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID of the record to be updated

    // Find the existing Aroducts record by ID and update its fields
    const productUpdated = await Products.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the Products record exists
    if (!productUpdated) {
      return res.status(404).json({ message: 'Aroducts record not found' });
    }

    // Respond with the updated Aroducts record
    res.status(200).render('success/update-product', { productUpdated });
  } catch (error) {
    console.error('Error updating Aroducts record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get
export const adminEditProducts = async (req, res) => {

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
    const product = await Products.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    const user = req.isAuthenticated() ? req.user : null;

    const accountant = user && user.accountant ? user.accountant : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    res.render("update-admin-product", {
      product,
      greeting,
      user,
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


// Controller function to get all products
export const adminVerifyProduct = async (req, res) => {
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
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameter
    const limit = 15; // Number of entries per page
    const skip = (page - 1) * limit;

    // Fetch all storage data
    // const allStorage = await User.find().skip(skip).limit(limit);
    const totalEntries = await Products.countDocuments();

    const totalPages = Math.ceil(totalEntries / limit);

    const users = await User.find();
    // Fetch all products from the database
    const products = await Products.find();

    // Determine the time of the day
    const greeting = getTimeOfDay();

    // Check if the user is authenticated and get their ID
    const user = req.isAuthenticated() ? req.user : null;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    // Render the all-properties view template with the products data
    res.render("verify-product", {
      products,
      greeting,
      user,
      manager,
      users,
      currentPage: page, 
      totalPages: totalPages,
      alert: req.query.alert, // Pass the alert message
    });
  
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching apartments.");
  }
};

// Get
export const verifyUpdateProduct = async (req, res) => {
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
    const product = await Products.findOne({ _id: req.params.id });

    // Determine the time of the day
    const greeting = getTimeOfDay();

    const user = req.isAuthenticated() ? req.user : null;

    res.render("verification", {
      product,
      greeting,
      user,
    });
  } catch (error) {
    // Handle errors gracefully
    console.error(error.message);
    res.status(404).send("User not found");
  }
};


// View get
export const viewproduct = async (req, res) => {
  try {
     const product = await Products.findOne({ _id: req.params.id });

    if (!product) {
      return res.status(404).send("product not found");
    }
  
    // Ensure photoUrls is set properly for the current product
    const updatedProduct = {
      ...product._doc,
      photoUrls: [product.photo, product.photo1, product.photo2].filter(Boolean) // Filter out undefined or empty strings
    };

      // Format the createdAt date and calculate days ago
      updatedProduct.formattedCreatedAt = moment(updatedProduct.createdAt).format('DD-MM-YYYY HH:mm');
      updatedProduct.daysAgo = moment().diff(moment(updatedProduct.createdAt), 'days');


    res.render("view-apt", {
      product,
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
  }
};

// Search bar
export const search = async (req, res) => {
  try {
    const search = await Products.distinct('location');

    res.render("all-admin-properties", {
      search
    });
  } catch (error) {
    console.log(error);
  }
};



// Get Upadate Sponsorship
export const editSponsorship = async (req, res) => {

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
    const product = await Products.findOne({ _id: req.params.id });

     // Determine the time of the day
     const greeting = getTimeOfDay();

     const user = req.isAuthenticated() ? req.user : null;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const accountant = user && user.accountant ? user.accountant : false;

    res.render("sponsorship-form", {
      locals,
      product,
      greeting,
      user,
      sudo, 
      accountant,
      manager,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.log(error);
  }
};


// Update Admin Apartments record
export const updateAdminSponsorship = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID of the record to be updated

    // Find the existing Apartments record by ID and update its fields
    const updatedProduct = await Apartments.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the Apartments record exists
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Apartments record not found' });
    }

    // Respond with the updated Apartments record
    res.status(200).render('success/update-apartment', { updatedProduct });
  } catch (error) {
    console.error('Error updating Apartments record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Admin Apartments record
export const updateAdminAvailability = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID of the record to be updated

    // Find the existing Apartments record by ID and update its fields
    const updatedProduct = await Products.findByIdAndUpdate(id, req.body, { new: true });

    // Check if the Apartments record exists
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Products record not found' });
    }

    // Respond with the updated Products record
    res.status(200).render('success/update-apartment', { updatedProduct });
  } catch (error) {
    console.error('Error updating products record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Upadate Avaliabilty
export const editAvailability = async (req, res) => {

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
    const product = await Products.findOne({ _id: req.params.id });

     // Determine the time of the day
     const greeting = getTimeOfDay();

     const user = req.isAuthenticated() ? req.user : null;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    const accountant = user && user.accountant ? user.accountant : false;

    res.render("avaliability-form", {
      product,
      greeting,
      user,
      sudo,
      accountant,
      manager,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.log(error);
  }
};


// Controller to display the search apartment page
export const searchProduct = async (req, res) => {
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
    // Get the search query from the request
    const { location } = req.query;

    // Find all verified products and sort them by sponsored status and createdAt timestamp in descending order
    let products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    // Filter products by location if a location is specified
    if (location) {
      products = products.filter(product => product.location === location);
    }

    // Get unique locations for the dropdown
    const locations = [...new Set(products.map(product => product.location))];

    const greeting = getTimeOfDay();
    const user = req.isAuthenticated() ? req.user : null;

    const role = user ? user.role : null; // Get user role if user is authenticated

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;

    // Process each product to set photoUrl, formattedCreatedAt, and daysAgo
    products.forEach(product => {
      // Ensure photoUrl is set properly
      product.photoUrl = product.photo || ''; // Use empty string if no photo is available

      // Format the createdAt date and calculate days ago
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

    // Render the search view template with the products and locations data
    res.render("search", {
      products,
      locations,
      greeting,
      user,
      role,
      manager,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
  }
};


// Controller to display the search product admin page
export const searchProductAdmin = async (req, res) => {
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
    // Get the search query from the request
    const { location } = req.query;

    // Find all verified products and sort them by sponsored status and createdAt timestamp in descending order
    let products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    // Filter products by location if a location is specified
    if (location) {
      products = products.filter(product => product.location === location);
    }

    // Get unique locations for the dropdown
    const locations = [...new Set(products.map(product => product.location))];

    const greeting = getTimeOfDay();
    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated

    // Process each product to set photoUrl, formattedCreatedAt, and daysAgo
    products.forEach(product => {
      // Ensure photoUrl is set properly
      product.photoUrl = product.photo || ''; // Use empty string if no photo is available

      // Format the createdAt date and calculate days ago
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

     // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
     const sudo = user && user.sudo ? user.sudo : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const accountant = user && user.accountant ? user.accountant : false;

    const manager = user && user.manager ? user.manager : false;

    // Render the search view template with the products and locations data
    res.render("search-admin", {
      products,
      locations,
      greeting,
      user,
      sudo,
      role,
      accountant,
      manager,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching products.");
  }
};


// Controller to display a single product's details
export const productDetail = async (req, res) => {
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
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const product = await Products.findById(id);

    if (!product) {
      return res.status(404).send("product not found");
    }

    // Increment the clicks count
    product.clicks = (product.clicks || 0) + 1;
    await product.save();

    // Ensure photoUrls is set properly for the current product
    const updatedProduct = {
      ...product._doc,
      photoUrls: [product.photo, product.photo1, product.photo2].filter(Boolean) // Filter out undefined or empty strings
    };

    // Fetch all products for other sections or navigation
    const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated
    const greeting = getTimeOfDay();

    // Format the createdAt date and calculate days ago
    updatedProduct.formattedCreatedAt = moment(updatedProduct.createdAt).format('DD-MM-YYYY HH:mm');
    updatedProduct.daysAgo = moment().diff(moment(updatedProduct.createdAt), 'days');

    res.render("product-detail", {
      product: updatedProduct,
      products, // Ensure products are passed to the template
      user,
      role,
      greeting,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the product details.");
  }
};


// // Controller to display a single product's details
// export const adminProductDetail = async (req, res) => {
//   const getTimeOfDay = () => {
//   const currentHour = new Date().getHours();
//   if (currentHour >= 5 && currentHour < 12) {
//     return 'Good Morning';
//   } else if (currentHour >= 12 && currentHour < 18) {
//     return 'Good Afternoon';
//   } else {
//     return 'Good Evening';
//   }
// };
// try {
//   const { id } = req.params;

//   // Validate ObjectId
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).send("Invalid product ID");
//   }

//   const product = await Products.findById(id);

//   if (!product) {
//     return res.status(404).send("product not found");
//   }

//     // Increment the clicks count
//     product.clicks = (product.clicks || 0) + 1;
//     await product.save();

//   // Ensure photoUrls is set properly for the current product
//   const updatedProduct = {
//     ...product._doc,
//     photoUrls: [product.photo, product.photo1, product.photo2].filter(Boolean) // Filter out undefined or empty strings
//   };

//   // Fetch all products for other sections or navigation
//   const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

//   const user = req.isAuthenticated() ? req.user : null;
//   const role = user ? user.role : null; // Get user role if user is authenticated
//   const greeting = getTimeOfDay();

//   // Format the createdAt date and calculate days ago
//   updatedProduct.formattedCreatedAt = moment(updatedProduct.createdAt).format('DD-MM-YYYY HH:mm');
//   updatedProduct.daysAgo = moment().diff(moment(updatedProduct.createdAt), 'days');


//   // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
//   const sudo = user && user.sudo ? user.sudo : false;

//   // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
//   const accountant = user && user.accountant ? user.accountant : false;

//   // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
//   const manager = user && user.manager ? user.manager : false;

//   res.render("product-detail-admin", {
//     product: updatedProduct,
//     products,
//     user,
//     greeting,
//     role,
//     sudo,
//     accountant,
//     manager,
//     alert: req.query.alert, // Pass the alert message
//   });
// } catch (error) {
//   console.error(error);
//   res.status(500).send("An error occurred while fetching the product details.");
// }
// };


// Controller to display a single product's details for admin
export const adminProductDetail = async (req, res) => {
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
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Increment the clicks count
    product.clicks = (product.clicks || 0) + 1;
    await product.save();

    // Ensure photoUrls is set properly for the current product
    const updatedProduct = {
      ...product._doc,
      photoUrls: [product.photo, product.photo1, product.photo2].filter(Boolean) // Filter out undefined or empty strings
    };

    // Fetch all verified products for other sections or navigation
    const products = await Products.find({ verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    const user = req.isAuthenticated() ? req.user : null;
    const role = user ? user.role : null; // Get user role if user is authenticated
    const greeting = getTimeOfDay();

    // Format the createdAt date and calculate days ago
    updatedProduct.formattedCreatedAt = moment(updatedProduct.createdAt).format('DD-MM-YYYY HH:mm');
    updatedProduct.daysAgo = moment().diff(moment(updatedProduct.createdAt), 'days');

    // Determine user permissions
    const permissions = {
      sudo: user && user.sudo ? user.sudo : false,
      accountant: user && user.accountant ? user.accountant : false,
      manager: user && user.manager ? user.manager : false,
    };

    res.render("product-detail-admin", {
      product: updatedProduct,
      products,
      user,
      greeting,
      role,
      ...permissions, // Spread user permissions
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the product details. Please try again later.");
  }
};
