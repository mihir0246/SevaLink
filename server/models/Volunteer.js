const mongoose = require('mongoose');

// Mirrors OVP Volunteer GraphQL type exactly
const VolunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String },
  address1: { type: String },
  address2: { type: String },
  city: { type: String },
  postcode: { type: Number },
  dateOfBirth: { type: Date },
  canDeliver: { type: Boolean, default: true },
  availableHours: { type: Number, default: 10 },
  skills: [{ type: String }],
  actionsCompleted: { type: Number, default: 0 },
  actionsActive: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  hoursContributed: { type: Number, default: 0 },
  location: { type: String },
  active: { type: Boolean, default: true },
  joinedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
