const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // You'll need to install this: npm install bcryptjs

const user = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
  },
}, {
  timestamps: true
});

// Pre-save hook to hash password before saving
user.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password in the database
user.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
});

const User = mongoose.model('User', user);

module.exports = User;