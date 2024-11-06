const mongoose = require('mongoose');

// Define the embedded schema for pantry items 
const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
});

// Define the userSchema and embed the foodSchema within it as an array
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  pantry: [foodSchema]  // Embed the foodSchema here as an array
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
