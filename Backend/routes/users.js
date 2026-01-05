const router = require('express').Router();
let User = require('../models/user'); // Import your User model
const jwt = require('jsonwebtoken'); // You'll need to install this: npm install jsonwebtoken

// @route   POST /users/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, password });
    await user.save();

    // Generate a token upon successful registration
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /users/login
// @desc    Authenticate user & get JWT token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // 1. Find the user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    // 2. Use user.comparePassword(candidatePassword) to verify the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // 3. If valid, generate a JWT and send it back
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // JWT_SECRET should be in your .env

    res.json({
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;