import Apartments from '../models/products.js';
import User from '../models/auth.js';
import moment from 'moment';


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

    // Find all verified apartments created by the authenticated user
    const apartments = await Apartments.find({ user: userId, verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });

    const greeting = getTimeOfDay();
    const role = user.role;

    // Process each apartment to set photoUrl, formattedCreatedAt, and daysAgo
    apartments.forEach(apartment => {
      // Ensure photoUrl is set properly
      apartment.photoUrl = apartment.photo || ''; // Use empty string if no photo is available

      // Format the createdAt date and calculate days ago
      apartment.formattedCreatedAt = moment(apartment.createdAt).format('DD-MM-YYYY HH:mm');
      apartment.daysAgo = moment().diff(moment(apartment.createdAt), 'days');
    });

    // Render the my-post view template with the apartments data
    res.render("my-post", {
      apartments,
      greeting,
      user,
      role,
      alert: req.query.alert, // Pass the alert message
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching apartments.");
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
      const apartments = await Apartments.find({ user: userId, verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
  
      const greeting = getTimeOfDay();
      const role = user.role;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const sudo = user && user.sudo ? user.sudo : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const accountant = user && user.accountant ? user.accountant : false;

      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const manager = user && user.manager ? user.manager : false;
  
      // Process each apartment to set photoUrl, formattedCreatedAt, and daysAgo
      apartments.forEach(apartment => {
        // Ensure photoUrl is set properly
        apartment.photoUrl = apartment.photo || ''; // Use empty string if no photo is available
  
        // Format the createdAt date and calculate days ago
        apartment.formattedCreatedAt = moment(apartment.createdAt).format('DD-MM-YYYY HH:mm');
        apartment.daysAgo = moment().diff(moment(apartment.createdAt), 'days');
      });
  
      // Render the my-post view template with the apartments data
      res.render("my-post-admin", {
        apartments,
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
      res.status(500).send("An error occurred while fetching apartments.");
    }
  };


// Update Admin Apartments record
export const updateApartments = async (req, res) => {
    try {
      const { id } = req.params; // Extract the ID of the record to be updated
  
      // Find the existing Apartments record by ID and update its fields
      const updatedApartment = await Apartments.findByIdAndUpdate(id, req.body, { new: true });
  
      // Check if the Apartments record exists
      if (!updatedApartment) {
        return res.status(404).json({ message: 'Apartments record not found' });
      }
  
      // Respond with the updated Apartments record
      res.status(200).render('success/update-apartment', { updatedApartment });
    } catch (error) {
      console.error('Error updating Apartments record:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


// Controller function to delete an apartment
export const deleteApartment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Ensure the apartment belongs to the authenticated user
    const apartment = await Apartments.findOneAndDelete({ _id: id, user: userId });

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found or you do not have permission to delete this apartment.' });
    }

    // res.status(200).json({ message: 'Apartment deleted successfully.' });
    res.render("success/delete-apartment");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the apartment.' });
  }
};


// Get
export const getUpdateForm = async (req, res) => {
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
      const apartment = await Apartments.findOne({ _id: req.params.id });
  
      // Determine the time of the day
      const greeting = getTimeOfDay();
  
      const user = req.isAuthenticated() ? req.user : null;
      const role = user.role;
  
      res.render("update-apartment", {
        locals,
        apartment,
        greeting,
        user,
        role,
      });
    } catch (error) {
      // Handle errors gracefully
      console.error(error.message);
      res.status(404).send("User not found");
    }
  };