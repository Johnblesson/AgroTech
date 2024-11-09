import Products from '../models/products.js'; // Products model
import User from '../models/auth.js'; // User model
import moment from 'moment'; // Date formatting library


// Controller function to render the my-post page
export const myPost = async (req, res) => {
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
  
    if (!user) {
      return res.redirect('/login'); // Redirect to login if user is not authenticated
    }

    const userId = user._id;

    // Find all verified products created by the authenticated user
    const products = await Products.find({ user: userId, verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    const greeting = getTimeOfDay();
    const role = user.role;

   // Ensure photoUrl is set properly for each product
   products.forEach(product => {
    if (!product.photos || product.photos.length === 0) {
      product.photoUrl = ''; // Initialize an empty string if no photos are available
    } else {
      product.photoUrl = product.photos[0]; // Set photoUrl to the first photo in the photos array
    }
  });

    // Render the my-post view template with the products data
    res.render("my-post", {
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

// Controller function to render the admin my-post page
  export const myPostAdmin = async (req, res) => {
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
  
      if (!user) {
        return res.redirect('/login'); // Redirect to login if user is not authenticated
      }
  
      const userId = user._id;
  
      // Find all verified apartments created by the authenticated user
      const products = await Products.find({ user: userId, verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
  
      const greeting = getTimeOfDay();
      const role = user.role;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const sudo = user && user.sudo ? user.sudo : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;
  
       // Ensure photoUrl is set properly for each product
       products.forEach(product => {
        if (!product.photos || product.photos.length === 0) {
          product.photoUrl = ''; // Initialize an empty string if no photos are available
        } else {
          product.photoUrl = product.photos[0]; // Set photoUrl to the first photo in the photos array
        }
      });
      // Render the my-post view template with the products data
      res.render("my-post-admin", {
        products,
        greeting,
        user,
        role,
        sudo,
        accountant,
        manager,
        alert: req.query.alert, // Pass the alert message
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching products.");
    }
  };


// Update Admin Products record
export const updateProducts = async (req, res) => {
    try {
      const { id } = req.params; // Extract the ID of the record to be updated
  
      // Find the existing Products record by ID and update its fields
      const updatedProduct = await Products.findByIdAndUpdate(id, req.body, { new: true });
  
      // Check if the Products record exists
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Products record not found' });
      }
  
      // Respond with the updated Products record
      res.status(200).render('success/update-product', { updatedProduct });
    } catch (error) {
      console.error('Error updating Products record:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


// Controller function to delete an product
export const deleteProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Ensure the product belongs to the authenticated user
    const product = await Products.findOneAndDelete({ _id: id, user: userId });

    if (!product) {
      return res.status(404).json({ message: 'product not found or you do not have permission to delete this product.' });
    }

    // res.status(200).json({ message: 'product deleted successfully.' });
    res.render("success/delete-product");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the product.' });
  }
};


// Get
export const getUpdateForm = async (req, res) => {
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
      const role = user.role;
  
      res.render("update-product", {
        product,
        greeting,
        user,
        role,
        alert: req.query.alert, // Pass the alert message
      });
    } catch (error) {
      // Handle errors gracefully
      console.error(error.message);
      res.status(404).send("User not found");
    }
  };
