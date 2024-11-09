import Products from "../models/products.js"; // Products model
import User from "../models/auth.js"; // User model
import Applications from "../models/apply.js"; // Applications model
import Agents from "../models/agents.js"; // Agents model
import PageViews from "../models/pageViews.js"; // PageViews model
import IPAddress from "../models/ipaddress.js"; // IPAddress model

export const mainAdmin = async (req, res) => {
    try {
        // Fetch counts for each entity
        const productsCount = await Products.countDocuments();
        const usersCount = await User.countDocuments();
        const applicationsCount = await Applications.countDocuments();
        const agentsCount = await Agents.countDocuments();
        const ipAddressCount = await IPAddress.countDocuments();

        // Fetch counts for specific user roles
        const adminCount = await User.countDocuments({ role: 'admin' });
        const userCount = await User.countDocuments({ role: 'user' });
        const agentCount = await User.countDocuments({ role: 'agent' });

        // Increment the view count for the guest page
        const pageView = await PageViews.findOneAndUpdate(
                { page: 'guestPage' }, 
                { $inc: { views: 1 } }, 
                { upsert: true, new: true }
        );

        // Get the view count
        const views = pageView.views; // Get the view count
        const ipAddresses = await IPAddress.find().sort({ timestamp: -1 });
        const user = req.isAuthenticated() ? req.user : null;
        const sudo = user && user.sudo ? user.sudo : false;
        const accountant = user && user.accountant ? user.accountant : false;
        const manager = user && user.manager ? user.manager : false;

        // Render the administrator template and pass counts as data
        res.render('administrator', { 
            productsCount, 
            usersCount, 
            applicationsCount, 
            agentsCount,
            adminCount, 
            userCount,
            agentCount,
            views,
            user, 
            sudo,
            accountant, 
            manager,
            ipAddresses,
            ipAddressCount 
        });
    } catch (error) {
        console.log(error);
        // Handle errors appropriately, such as sending an error response
        res.status(500).json({ error: 'Internal server error' });
    }
}
