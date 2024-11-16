// Define middleware function
export const checkManagerMiddleware = (req, res, next) => {
    const { user } = req;
    // Check if sudo is true, allow access, otherwise forbid
    if (user && user.manager === true || user && user.sudo === true ) {
        next(); // Allow access
    } else {
        res.redirect('/sudo-only');
    }
};