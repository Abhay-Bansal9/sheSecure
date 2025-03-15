const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Secret key for JWT (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'she_secure_secret_key';

// Mock user database (replace with real database in production)
const users = [
  { id: 1, username: 'user', password: 'pass', email: 'user@example.com' }
];

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple validation
  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  
  // Check for existing user
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }
  
  // Create and sign JWT token
  jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: 3600 }, // 1 hour
    (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    }
  );
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', (req, res) => {
  // Auth middleware would normally go here to validate token
  // For demonstration purposes, we'll just return a mock user
  
  // The middleware would extract the user ID from the token
  // and find the user in the database
  const userId = 1; // This would come from the token
  
  const user = users.find(user => user.id === userId);
  
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router; 