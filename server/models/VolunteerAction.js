const mongoose = require('mongoose');

// Mirrors OVP VolunteerAction — core assignment model
const VolunteerActionSchema = new mongoose.Schema({
  title:                { type: String, required: true },
  description:          { type: String },
  status:               { type: String, enum: ['CREATED', 'ASSIGNED', 'PENDING_VERIFICATION', 'COMPLETED'], default: 'CREATED' },
  urgency:              { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  category:             { type: String, enum: ['Food', 'Medical', 'Shelter', 'Education', 'Other'] },
  assignedAt:           { type: Date },
  completedAt:          { type: Date },
  dueDate:              { type: Date },
  // Mirrors OVP's many-to-one relations
  volunteerId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  recipientId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Recipient' },
  distributionCentreId: { type: mongoose.Schema.Types.ObjectId, ref: 'DistributionCentre' },
  // Gemini AI matchmaking result
  aiMatchScore:         { type: Number },
  aiMatchReason:        { type: String },
  _createdAt:           { type: Date, default: Date.now },
});

module.exports = mongoose.model('VolunteerAction', VolunteerActionSchema);
