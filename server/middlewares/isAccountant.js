// Middleware to check if the user has ACCOUNTANT set to true
export const isAccountant = (req, res, next) => {
  try {
      // Assuming you have a user object attached to the request after authentication
      const user = req.user;
  
      if (user && (user.accountant === true || user.sudo === true || user.manager === true)) {
          next();
      } else {
          // User does not have ACCOUNTANT or SUDO role, send a forbidden response
          res.status(403).json({ msg: "You don't have permission to access this resource." });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};