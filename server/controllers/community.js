import Community from '../models/community.js';
import User from '../models/auth.js';

// Create a post
export const createPost = async (req, res) => {
  try {
    const newPost = await Community.create({
      post: req.body.post,
      createdBy: req.user._id,
    });

    // Populate the createdBy field to include the user photo and fullname
    await newPost.populate('createdBy', 'photo fullname');

    // Emit the new post to all connected clients
    req.io.emit('newPost', newPost);

    res.sendStatus(200); // Send success status without redirecting
  } catch (error) {
    res.status(500).send('Error creating post');
  }
};


// Delete a post
export const deletePost = async (req, res) => {
  try {
      const { postId } = req.params;
      const userId = req.user._id; // assuming req.user._id contains the authenticated user ID

      const post = await Community.findById(postId);

      if (!post) {
          return res.status(404).json({ message: 'Post not found' });
      }

      // Check if the authenticated user is the creator of the post
      if (post.createdBy.toString() !== userId.toString()) {
          return res.status(403).json({ message: 'Unauthorized to delete this post' });
      }

      await Community.findByIdAndDelete(postId);
      res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ message: 'Failed to delete post' });
  }
};


// Get all posts
export const getPosts = async (req, res) => {
  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return 'Good Morning';
    if (currentHour >= 12 && currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  try {
    const role = req.user.role; // Get the role of the logged-in user
    const isAdmin = role === 'admin';
    const page = parseInt(req.query.page) || 1; // Get current page or default to 1
    const limit = 5; // Number of posts per page
    const skip = (page - 1) * limit; // Calculate items to skip

    const posts = await Community.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'photo fullname')
      .populate({ path: 'comments.commentedBy', select: 'photo fullname' })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Community.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    const user = req.isAuthenticated() ? req.user : null;
    const greeting = getTimeOfDay();

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const sudo = user && user.sudo ? user.sudo : false;

    // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
    const manager = user && user.manager ? user.manager : false;
         
    const accountant = user && user.accountant ? user.accountant : false;

    res.render('com', {
      posts,
      isAdmin,
      role,
      user,
      sudo,
      accountant,
      manager,
      greeting,
      alert: req.query.alert,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
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

    // Emit the updated post to all clients
    req.io.emit('postLiked', { postId: post._id, likes: post.likes.length });

    res.sendStatus(200); // Send success status without redirecting
  } catch (error) {
    res.status(500).send('Error liking post');
  }
};



// Comment on a post

export const commentOnPost = async (req, res) => {
  try {
    const post = await Community.findById(req.params.postId);
    const newComment = {
      text: req.body.comment,
      commentedBy: req.user._id,
    };
    post.comments.push(newComment);
    await post.save();

    // Populate the commentedBy field to include user photo and fullname
    await post.populate('comments.commentedBy', 'photo fullname');

    // Emit the new comment to all clients
    req.io.emit('newComment', { postId: post._id, comment: newComment });

    // res.redirect('/community');
    res.sendStatus(200); // Send success status without redirecting
  } catch (error) {
    res.status(500).send('Error commenting on post');
  }
};
