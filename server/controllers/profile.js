import User from '../models/auth.js';
import moment from 'moment';
import Products from '../models/products.js';

export const profile = async (req, res) => {
  try {
    // Fetch a single user by ID
    const users = await User.findOne({ _id: req.params.id });

    // Ensure photoUrl is set properly for the user
    if (!users.photo) {
      users.photoUrl = '';
    } else {
      users.photoUrl = users.photo;
    }

    
    const user = req.isAuthenticated() ? req.user : null;

    const locals = {
      title: "User Profile",
      description: "This is the user's profile page.",
    };
    
    // Render the profile page with the user data
    res.render("profile", {
      locals,
      users,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred while fetching the user's profile.");
  }
};



  export const adminprofile = async (req, res) => {
    try {
      const users = await User.findOne({ _id: req.params.id });
  
     // Ensure photoUrl is set properly for each user
     users.forEach(user => {
      if (!user.photo) {
        user.photoUrl = '';
      } else {
        user.photoUrl = user.photo;
      }
    });

    const user = req.isAuthenticated() ? req.user : null;
  
      res.render("profile-admin", {
        users,
        locals,
        user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while fetching users profile.");
    }
  };


  
  export const getUserPostProfile = async (req, res) => {
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
        const userId = req.params.id;
        const user = await User.findById(userId).populate('communities'); // Populate communities

        if (!user) {
            return res.render('error', { errorMessage: 'User not found' });
        }

        
       // Fetch user data from the session or request object
      const sudo = user && user.sudo ? user.sudo : false;
      const role = req.user.role; // Get the role of the logged-in user
      const accountant = user && user.accountant ? user.accountant : false;
      const manager = user && user.manager ? user.manager : false;
      const isAdmin = role === 'admin';
      const greeting = getTimeOfDay();

          if (user.role === 'admin') {
            res.render('userProfileAdmin', {
              user,
              role,
              greeting,
              sudo,
              accountant,
              manager,
              isAdmin,
              alert: req.query.alert,
            });

          } 
          else if (user.role === 'user') {
            res.render('userProfile', {
              user,
              role,
              greeting,
              sudo,
              accountant,
              manager,
              isAdmin,
              alert: req.query.alert, // Pass the alert message to the template
            });
          }
          else {
            res.status(403).send('Unauthorized');
          }

    } catch (error) {
        console.error(error);
        res.render('error', { errorMessage: 'Error fetching user profile' });
    }
};




// Get all posts
// export const getPosts = async (req, res) => {
//   const getTimeOfDay = () => {
//     const currentHour = new Date().getHours();

//     if (currentHour >= 5 && currentHour < 12) {
//       return 'Good Morning';
//     } else if (currentHour >= 12 && currentHour < 18) {
//       return 'Good Afternoon';
//     } else {
//       return 'Good Evening';
//     }
//   };

//   try {
//       const role = req.user.role; // Get the role of the logged-in user
//       const isAdmin = role === 'admin'; // Define isAdmin based on the role
//       const posts = await Community.find()
//           .sort({ createdAt: -1 }) // Newest posts first
//           .populate('createdBy', 'photo fullname') // Populate user who created the post
//           .populate({
//               path: 'comments.commentedBy', // Populate commenters
//               select: 'photo fullname' // Select only the fields needed
//           });

//        // Fetch user data from the session or request object
//       const user = req.isAuthenticated() ? req.user : null;
//       const sudo = user && user.sudo ? user.sudo : false;
//       const accountant = user && user.accountant ? user.accountant : false;
//       const manager = user && user.manager ? user.manager : false;

//       const greeting = getTimeOfDay(); // Get the greeting based on the time of day

//       res.render('com', 
//         { 
//         posts, 
//         isAdmin, 
//         role, 
//         sudo, 
//         user, 
//         accountant, 
//         manager, 
//         greeting,
//         alert: req.query.alert, // Pass the alert message to the template
//       }); // Render the community page
//   } catch (error) {
//       console.error('Error fetching posts:', error); // Log the error for debugging
//       res.status(500).send('Error fetching posts');
//   }
// };

  
  // Update user data #Sudo Admin
  export const updateUser = async (req, res) => {
    try {
      // Extract the User ID from the request parameters
      const { id } = req.params;
  
      // Find the User record by ID and update its fields
      const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
  
      // Check if the User record exists
      if (!updatedUser) {
        return res.status(404).json({ message: 'User record not found' });
      }
  
      // Respond with the updated User record
      res.render('success/profile', { users: updatedUser }); // Pass the updated user data to the template
    } catch (error) {
      console.error('Error updating User record:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
   
  // Get all users
  export const getUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  // View user GET REQUEST
export const view = async (req, res) => {
  try {
    const users = await User.findOne({ _id: req.params.id });

    let relativePath = '';
  
    // Transform the photo path to match the URL served by Express
    if (users && users.photo) {
        const photoPath = users.photo.replace(/\\/g, '/');
        relativePath = photoPath.replace('public/assets/', '/assets/');
      }

    // Get the authenticated user from the request object
    const user = req.isAuthenticated() ? req.user : null;

    // Redirect to login if user is not authenticated
    if (!user) {
      return res.redirect('/login');
    }

    // Get the user ID from the authenticated user
    const userId = user._id;

    // Find all verified products created by the authenticated user
    const products = await Products.find({ user: userId, verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
    const role = user.role;

    // Process each product to set photoUrl, formattedCreatedAt, and daysAgo
    products.forEach(product => {
      // Ensure photoUrl is set properly
      product.photoUrl = product.photo || '';

      // Format the createdAt date and calculate days ago
      product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
      product.daysAgo = moment().diff(moment(product.createdAt), 'days');
    });

    res.render("view", {
      users,
      relativePath,
      user,
      role,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

  // View admin GET REQUEST
  export const viewAdminProfile = async (req, res) => {
    try {
      const users = await User.findOne({ _id: req.params.id });
  
      let relativePath = ''; // Declare relativePath outside the if block
    
        // Transform the photo path to match the URL served by Express
        if (users && users.photo) {
          const photoPath = users.photo.replace(/\\/g, '/'); // Replace backslashes with forward slashes
          relativePath = photoPath.replace('public/assets/', '/assets/'); // Remove "public/assets/" prefix and add "/assets/" route prefix
        }
  
            // Get the authenticated user from the request object
      const user = req.isAuthenticated() ? req.user : null;
  
      // Redirect to login if user is not authenticated
      if (!user) {
        return res.redirect('/login'); // Redirect to login if user is not authenticated
      }
  
      // Get the user ID from the authenticated user
      const userId = user._id;
  
      // Find all verified products created by the authenticated user
      const products = await Products.find({ user: userId, verification: 'verified' }).sort({ sponsored: -1, createdAt: -1 });
      const role = user.role;
  
      // Process each product to set photoUrl, formattedCreatedAt, and daysAgo
      products.forEach(product => {
        // Ensure photoUrl is set properly
        product.photoUrl = product.photo || ''; // Use empty string if no photo is available
  
        // Format the createdAt date and calculate days ago
        product.formattedCreatedAt = moment(product.createdAt).format('DD-MM-YYYY HH:mm');
        product.daysAgo = moment().diff(moment(product.createdAt), 'days');
      });
  
      res.render("view1", {
        users,
        relativePath,
        user,
        role,
        products,
      });
    } catch (error) {
      console.log(error);
    }
  };


 // Get user's profile page
  export const getUpdateProfile = async (req, res) => {
 
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
      const users = await User.findOne({ _id: req.params.id });
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

         // Check the role and render the appropriate page
    if (role === 'admin') {
      // Render the admin update profile's page
      res.render('update-profile-admin', {
          users,
          greeting,
          user,
          sudo,
          accountant,
          manager,
          role,
          alert: req.query.alert, // Pass the alert message
      });
  } else if (role === 'user') {
      // Render the user update profile page
      res.render('update-profile', {
          users, 
          greeting,
          user,
          role,
          alert: req.query.alert, // Pass the alert message
      });
  } else {
      // Handle other roles or unauthorized access
      res.status(403).send('Unauthorized');
  }
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };
