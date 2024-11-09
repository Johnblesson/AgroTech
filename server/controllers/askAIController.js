import OpenAI from 'openai'; // Correct import for the latest version
import dotenv from 'dotenv'; // Environment variable library

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAIResponse = async (req, res) => {
    try {
      const userMessage = req.body.message;
  
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
      });
  
      const aiMessage = response.choices[0].message.content;
      res.json({ aiMessage });
    } catch (error) {
      console.error('Error fetching AI response:', error);
  
      if (error.code === 'insufficient_quota') {
        return res.status(429).json({ error: 'You have exceeded your quota. Please check your plan and try again later.' });
      }
  
      res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
  };
  

  
// Render the Ask-AI page
export const getAskAi = async (req, res) => {
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
      const user = req.isAuthenticated() ? req.user : null;
      const role = user ? user.role : null; // Get user role if user is authenticated
  
      // Determine the time of the day
      const greeting = getTimeOfDay();
      const isAdmin = role === 'admin'; // Define isAdmin based on the role
      // Fetch user data from the session or request object (assuming req.user is set by the authentication middleware)
      const sudo = user && user.sudo ? user.sudo : false;
      const accountant = user && user.accountant ? user.accountant : false;
      const manager = user && user.manager ? user.manager : false;
  
      // Render the Ask-AI page with initial conversation data and user information
      res.render('ask-ai', {
        user,
        greeting,
        sudo,
        accountant,
        role,
        isAdmin,
        manager,
        alert: req.query.alert,
        conversation: [], // Initialize with an empty conversation array
      });
    } catch (error) {
      console.error('Error rendering the page:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  