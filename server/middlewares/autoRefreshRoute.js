// Define middleware function to refresh route every 5 seconds
export const autoRefreshMiddleware = (req, res, next) => {
    // Use setInterval to redirect/reload every 5 seconds
    const intervalId = setInterval(() => {
      // Redirect or reload logic here
      res.redirect(req.originalUrl); // Redirect to the same URL
      // Alternatively, you can use res.render('your-template') for rendering a template
    }, 5000); // 5000 milliseconds = 5 seconds
  
    // Attach intervalId to res.locals so it can be cleared when necessary
    res.locals.intervalId = intervalId;
  
    // Call next() to pass control to the next middleware/route handler
    next();
  };