// controllers/communityController.js
import Community from '../models/community.js';
import User from '../models/auth.js';

// Create a post
export const createPost = async (req, res) => {
  try {
    const newPost = await Community.create({
      post: req.body.post,
      createdBy: req.user._id,
    });
    res.redirect('/community'); // Redirect to the community page after posting
  } catch (error) {
    res.status(500).send('Error creating post');
  }
};


// Get all posts
export const getPosts = async (req, res) => {
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
      const role = req.user.role; // Get the role of the logged-in user
      const isAdmin = role === 'admin'; // Define isAdmin based on the role
      const posts = await Community.find()
          .sort({ createdAt: -1 }) // Newest posts first
          .populate('createdBy', 'photo fullname') // Populate user who created the post
          .populate({
              path: 'comments.commentedBy', // Populate commenters
              select: 'photo fullname' // Select only the fields needed
          });

       // Fetch user data from the session or request object
      const user = req.isAuthenticated() ? req.user : null;
      const sudo = user && user.sudo ? user.sudo : false;
      const accountant = user && user.accountant ? user.accountant : false;
      const manager = user && user.manager ? user.manager : false;

      const greeting = getTimeOfDay(); // Get the greeting based on the time of day

      res.render('com', 
        { 
        posts, 
        isAdmin, 
        role, 
        sudo, 
        user, 
        accountant, 
        manager, 
        greeting,
        alert: req.query.alert, // Pass the alert message to the template
      }); // Render the community page
  } catch (error) {
      console.error('Error fetching posts:', error); // Log the error for debugging
      res.status(500).send('Error fetching posts');
  }
};


// Like a post
export const likePost = async (req, res) => {
  try {
    const post = await Community.findById(req.params.postId);
    if (!post.likes.includes(req.user._id)) {
      post.likes.push(req.user._id);
      await post.save();
    }
    res.redirect('/community');
  } catch (error) {
    res.status(500).send('Error liking post');
  }
};


// Comment on a post
export const commentOnPost = async (req, res) => {
  try {
    const post = await Community.findById(req.params.postId);
    post.comments.push({
      text: req.body.comment,
      commentedBy: req.user._id,
    });
    await post.save();
    res.redirect('/community');
  } catch (error) {
    res.status(500).send('Error commenting on post');
  }
};
