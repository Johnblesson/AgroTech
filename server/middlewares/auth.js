// This middleware checks if the user is logged in before allowing access to protected routes
const ensureAuthenticated = (req, res, next) => {
    // Check if the user is authenticated (you might have your own authentication logic)
    if (req.session && req.session.user) {
      // If the user is authenticated, proceed to the next middleware or route handler
      next();
    } else {
      // If the user is not authenticated, redirect them to the login page or send an unauthorized response
      res.redirect("/");
    }
  };
    
  export default ensureAuthenticated;