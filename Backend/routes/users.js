const express = require('express');
const router = express.Router();
const User = require('../models/user');

// get all or filter users
router.get('/', async (req, res) => {
    console.log('Received Query:', req.query);
  try {
    const { search, passwordSearch} = req.query;

    const filter = {};

    if (search && passwordSearch) {
      filter.username = search;
      filter.password = passwordSearch;
    } else if (search) {
      filter.username = search;
    } else if (passwordSearch) {
      filter.password = passwordSearch;
    }

    const users = await User.find(filter).select('_id username password');

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /users/login - Login a user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password provided
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        // Check if password matches
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        // Success - return user info (without password)
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// POST /users/register - Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Username already taken.' });
        }

        const newUser = new User({ username, password });
        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            user: {
                id: savedUser._id,
                username: savedUser.username
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// post new users (original route - kept for backwards compatibility)
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const newUser = new User({
        username,
        password,
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;