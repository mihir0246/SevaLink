const mongoose = require('mongoose');

// Mirrors OVP Recipient GraphQL type + SevaLink needs fields
const RecipientSchema = new mongoose.Schema({
  firstName:         { type: String, required: true },
  lastName:          { type: String, required: true },
  phone:             { type: String },
  address1:          { type: String },
  address2:          { type: String },
  city:              { type: String },
  postcode:          { type: Number },
  lat:               { type: Number },
  long:              { type: Number },
  actionsCompleted:  { type: Number, default: 0 },
  deliveryDays:      { type: String },
  preferredProducts: { type: String }, // comma-separated e.g. "Food,Medical"
  // SevaLink-specific fields
  householdId:       { type: String },
  needType:          { type: String, enum: ['Food', 'Medical', 'Shelter', 'Education', 'Other'], default: 'Food' },
  urgency:           { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  quantity:          { type: String },
  status:            { type: String, enum: ['pending', 'assigned', 'in-progress', 'pending-verification', 'completed'], default: 'pending' },
  // Link to active assignment
  assignedTo:        { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  assignedAction:    { type: mongoose.Schema.Types.ObjectId, ref: 'VolunteerAction' },
  metadata:          { type: mongoose.Schema.Types.Mixed }, // flexible fields extracted by AI
  createdAt:         { type: Date, default: Date.now },
});

module.exports = mongoose.model('Recipient', RecipientSchema);
