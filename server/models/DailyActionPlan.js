const mongoose = require('mongoose');

// Mirrors OVP DailyActionPlan — analytics summary of each matchmaking run
const DailyActionPlanSchema = new mongoose.Schema({
  owner:                       { type: String, required: true }, // admin username who triggered it
  date:                        { type: Date, default: Date.now },
  numberOfCasesCreated:        { type: Number, default: 0 },
  numberOfVolunteersAssigned:  { type: Number, default: 0 },
  numberOfRecipients:          { type: Number, default: 0 },
  aiPowered:                   { type: Boolean, default: true },
  geminiSummary:               { type: String }, // AI-generated summary of the plan
});

module.exports = mongoose.model('DailyActionPlan', DailyActionPlanSchema);
