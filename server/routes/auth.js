const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const config = require('../config/config');
require('../config/passport'); // initialize passport strategy

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, skills, city } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const username = email.split('@')[0] + '_' + Date.now();
    user = new User({ firstName, lastName, email, password: hashed, role: role || 'volunteer', username });
    await user.save();

    if ((role || 'volunteer') === 'volunteer') {
      const volunteer = new Volunteer({
        userId: user._id, firstName, lastName, email, username,
        skills: skills || [], city: city || '', active: true,
      });
      await volunteer.save();
    }

    const payload = { id: user._id, email: user.email, role: user.role, firstName: user.firstName };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
    res.json({ token, user: { id: user._id, firstName, lastName, email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ msg: 'Please sign in with Google' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: user._id, email: user.email, role: user.role, firstName: user.firstName };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// Step 1: Redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Step 2: Google redirects back here
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${config.frontendUrl}/login?error=google_failed` }),
  (req, res) => {
    const user = req.user;
    const payload = { id: user._id, email: user.email, role: user.role, firstName: user.firstName };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
    const userData = encodeURIComponent(JSON.stringify({
      id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role
    }));
    // Redirect to frontend with token in URL — frontend reads it and saves to localStorage
    const dest = user.role === 'admin' ? '/admin/dashboard' : '/volunteer/dashboard';
    res.redirect(`${config.frontendUrl}/auth/google/success?token=${token}&user=${userData}&redirect=${dest}`);
  }
);

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
router.get('/users', [require('../middleware/auth'), require('../middleware/roleCheck')('admin')], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
