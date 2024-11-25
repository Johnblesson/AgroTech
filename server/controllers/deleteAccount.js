import DeleteAccounts from "../models/deleteAccount.js";


// This function is used to delete a user account
export const deleteAccount = async (req, res) => {
    try {
        const { fullname, createdBy, reason, msg } = req.body;
        const deleteAccount = new DeleteAccounts({
            fullname,
            createdBy,
            reason,
            msg
        });
        await deleteAccount.save();
        res.redirect('/account-delete');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
}


// This function is used to view the delete account page
  export const getDeleteForm = async (req, res) => {

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
    const role = user ? user.role : null;
    const isAdmin = role === 'admin'; // Define isAdmin based on the role
    const sudo = user && user.sudo ? user.sudo : false;
    const accountant = user && user.accountant ? user.accountant : false;
    const manager = user && user.manager ? user.manager : false;
  
      // Render the apply page with the necessary data
      res.render('delete-form', {
        user,
        greeting,
        role,
        isAdmin,
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


// Get All Delete Account Requests Controller
export const getAllDeleteRequests = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Requested page number from query parameter
      const limit = 15; // Number of entries per page
      const skip = (page - 1) * limit;
  
      // Count total deletion requests
      const totalEntries = await DeleteAccounts.countDocuments();
  
      // Calculate total pages
      const totalPages = Math.ceil(totalEntries / limit);
  
      // Fetch deletion requests with pagination
      const deleteRequests = await DeleteAccounts.aggregate([
        // Stage 1: Apply skip and limit for pagination
        { $skip: skip },
        { $limit: limit },
      ]);
  
      // Render the results
      res.render('all-delete-requests', {
        deleteRequests: deleteRequests,
        currentPage: page,
        totalPages: totalPages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching deletion requests.');
    }
  };


//   // render all delete requests page
// export const renderAllDeleteRequests = async (req, res) => {
//     try {
//       // Fetch all delete requests
//       const deleteRequests = await DeleteAccounts.find();
  
//       // Render the results
//       res.render('all-delete-requests', {
//         deleteRequests: deleteRequests,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('An error occurred while fetching deletion requests.');
//     }
//   };
  

  // deleteRequests Controller
export const deleteRequests = async (req, res) => {
    try {
      const deleteRequest = await DeleteAccounts.findById(req.params.id);
  
      if (!deleteRequest) {
        return res.status(404).send('Delete request not found');
      }
  
      await deleteRequest.remove();
      res.redirect('/all-delete-requests');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while deleting the request');
    }
  };


  export const viewFullRequestDeletion = async (req, res) => {
    try {
      const requestDeletion = await DeleteAccounts.findOne({ _id: req.params.id });
  
      res.render("view-full-request-deletion", {
        requestDeletion,
      });
    } catch (error) {
      console.log(error);
    }
  };