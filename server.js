import express from "express"; // Import express
import bodyParser from "body-parser"; // Import body-parser
import cors from "cors"; // Import cors
import dotenv from "dotenv"; // Import dotenv
import multer from "multer"; // Import multer
import ejs from "ejs"; // Import ejs
import path from "path"; // Import path module from Node.js
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import path module
import session from 'express-session'; // Import express-session
import flash from 'connect-flash'; // Import connect-flash
import cookieParser from 'cookie-parser'; // Import cookie-parser
import methodOverride from 'method-override'; // Import method-override
import passport from './server/passport/passport-config.js'; // Import passport
import connectDB from './server/database/connection.js'; // Import connectDB
import viewRoutes from "./server/routes/viewRoutes.js"; // Import viewRoutes
import authRoutes from "./server/routes/auth.js"; // Import authRoutes
import homepageRoutes from "./server/routes/homepage.js"; // Import homepageRoutes
import profileRoutes from "./server/routes/profile.js"; // Import profileRoutes
import productsRoutes from "./server/routes/products.js"; // Import productsRoutes
import applyRoute from "./server/routes/apply.js"; // Import applyRoute
import adminRoutes from "./server/routes/admin.js"; // Import adminRoutes
import contactRoutes from "./server/routes/contact.js"; // Import contactRoutes
import agentsRoute from "./server/routes/agents.js"; // Import agentsRoute
import askAiRoute from "./server/routes/ask-ai.js"; // Import askAiRoute
import communityRoutes from "./server/routes/community.js"; // Import communityRoutes
import http from "http"; // Import http module from Node.js
import compression from "compression"; // Import compression
import { Server } from "socket.io"; // Import socket.io

// Create an Express application
const app = express(); // Create an Express application
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Create Socket.io server

dotenv.config(); // Configure dotenv to use environment variables
connectDB(); // Connect to the database
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Use cookie-parser
app.use(flash()); // Use connect-flash
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Use cors
app.set('trust proxy', true) // Trust proxy
app.use(compression()); // Use compression

// Pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Set the view engine to ejs
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = path.join(__dirname, './views');
app.set('view engine', 'ejs');
app.set('views', templatePath);

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use("/assets", express.static(path.join(__dirname, "public/assets"), {
  maxAge: '30d', // Cache assets for 30 days
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

// Add express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, // Use the SESSION_SECRET environment variable as the secret
  resave: false, // Don't save session if unmodified
  saveUninitialized: true, // Always create a session
  cookie: { maxAge: 36000000 } // Set session to expire after 10 hours
}))

// Make flash messages available in all templates
app.use((req, res, next) => {
  res.locals.errorMessages = req.flash('error');
  res.locals.successMessages = req.flash('success');
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware to parse "_method" query parameter
app.use(methodOverride('_method'));

// Socket.io connection
io.on('connection', (socket) => {
  // console.log('A user connected');
  socket.on('disconnect', () => {
    // console.log('A user disconnected');
  });
});

// Get weather API key
app.get('/getWeatherKey', (req, res) => {
  res.json({ apiKey: process.env.WEATHER_API_KEY });
});

// Routes
app.use(viewRoutes); // Use viewRoutes
app.use(authRoutes); // Use authRoutes
app.use(homepageRoutes); // Use homepageRoutes
app.use(profileRoutes); // Use profileRoutes
app.use(productsRoutes); // Use productsRoutes
app.use(applyRoute); // Use applyRoute
app.use(adminRoutes); // Use adminRoutes
app.use(contactRoutes); // Use contactRoutes
app.use(agentsRoute); // Use agentsRoute
app.use(askAiRoute); // Use askAiRoute
app.use('/community', communityRoutes); // Use communityRoutes

// Set up the server to listen on port 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export { io }; // Export io to use in other files
