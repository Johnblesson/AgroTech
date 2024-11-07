import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import passport from './server/passport/passport-config.js';
import connectDB from './server/database/connection.js';
import viewRoutes from "./server/routes/viewRoutes.js";
import authRoutes from "./server/routes/auth.js";
import homepageRoutes from "./server/routes/homepage.js";
import profileRoutes from "./server/routes/profile.js";
import apartmentsRoutes from "./server/routes/products.js";
import applyRoute from "./server/routes/apply.js";
import adminRoutes from "./server/routes/admin.js";
import contactRoutes from "./server/routes/contact.js";
import agentsRoute from "./server/routes/agents.js";
import askAiRoute from "./server/routes/ask-ai.js";
import communityRoutes from "./server/routes/community.js";
import http from "http";
import compression from "compression";
import { Server } from "socket.io"; 

// Create an Express application
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Create Socket.io server

dotenv.config();
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set('trust proxy', true)
app.use(compression());

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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 36000000 }
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

// Routes
app.use(viewRoutes);
app.use(authRoutes);
app.use(homepageRoutes);
app.use(profileRoutes);
app.use(apartmentsRoutes);
app.use(applyRoute);
app.use(adminRoutes);
app.use(contactRoutes);
app.use(agentsRoute);
app.use(askAiRoute);
app.use('/community', communityRoutes);

// Set up the server to listen on port 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export { io }; // Export io to use in other files
