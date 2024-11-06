const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');

const authController = require('./controllers/auth.js');

const port = process.env.PORT || '3000';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware function to restrict access to logged-in users only
const isSignedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/auth/sign-in');
};

// Middleware function to make user data available in views
const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};

// Middleware Setup
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passUserToView); // Make user data available in views

// Home Route
app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: req.session.user,
    pantry: null  // Pass pantry as null by default for now
  });
});

// Register authController with and without /auth prefix
app.use('/auth', authController);  // For auth routes like /auth/sign-in and /auth/sign-up
app.use(authController);  // For routes like /users/:userId/foods without prefix

// Start the server
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
