// Middleware to check if the user has ADMIN role
export const isAdmin = (req, res, next) => {
    try {
      // Assuming you have a user object attached to the request after authentication
      const user = req.user;
  
      if (user && user.role === 'admin') {
        // User has ADMIN role, proceed to the next middleware or route handler
        next();
      } else {
        // User does not have ADMIN role, send a forbidden response
        // res.status(403).json({ msg: "You don't have permission to access this resource." });
        res.redirect('/admin-only');
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };