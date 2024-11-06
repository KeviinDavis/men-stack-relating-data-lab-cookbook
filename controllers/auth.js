const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');

// Authentication Routes

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs');
});

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.send('Username already taken.');
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.send('Password and Confirm Password must match');
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;
    await User.create(req.body);

    res.redirect('/auth/sign-in');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.');
    }

    const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password);
    if (!validPassword) {
      return res.send('Login failed. Please try again.');
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id
    };

    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// Basic Pantry View Route (Protected)
router.get('/users/:userId/foods', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.render('index.ejs', { user: req.session.user, pantry: user.pantry });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// Create Route: Add new pantry item to the user's pantry
router.post('/users/:userId/foods', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    user.pantry.push({ name: req.body.name });  
    await user.save();  
    res.redirect(`/users/${req.params.userId}/foods`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// Edit Route: Show form to edit a pantry item
router.get('/users/:userId/foods/:itemId/edit', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const item = user.pantry.id(req.params.itemId);
    res.render('index.ejs', { user: req.session.user, pantry: user.pantry, itemToEdit: item });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// Update Route: Update a pantry item
router.put('/users/:userId/foods/:itemId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const item = user.pantry.id(req.params.itemId);  // Find the item by ID
    item.name = req.body.name;  // Update the item name
    await user.save();  // Save changes
    res.redirect(`/users/${req.params.userId}/foods`);  // Redirect back to pantry view
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// Delete Route: Remove a pantry item
router.delete('/users/:userId/foods/:itemId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const itemIndex = user.pantry.findIndex(item => item._id.toString() === req.params.itemId);

    if (itemIndex > -1) {
      user.pantry.splice(itemIndex, 1);
      await user.save(); 
    }
    res.redirect(`/users/${req.params.userId}/foods`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});



module.exports = router;
