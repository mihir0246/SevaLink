const mongoose = require('mongoose');

// Auth user — supports both Admin and Volunteer roles
const UserSchema = new mongoose.Schema({
  firstName:  { type: String, required: true },
  lastName:   { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: false },
  googleId:   { type: String },
  username:   { type: String, unique: true, sparse: true },
  role:       { type: String, enum: ['admin', 'volunteer'], default: 'volunteer' },
  active:     { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
