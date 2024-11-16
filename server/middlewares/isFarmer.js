
export const isFarmer = (req, res, next) => {
  try {
    const user = req.user;

    if (user && user.role === 'farmer') {
      // User has admin or farmer role, proceed to the next middleware or route handler
      next();
    } else {
      // User does not have the required role, redirect or send a forbidden response
      res.redirect('/farmer-only');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
