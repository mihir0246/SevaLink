const mongoose = require('mongoose');

// Mirrors OVP DistributionCentre (implements Address interface)
const DistributionCentreSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  address1: { type: String },
  address2: { type: String },
  city:     { type: String },
  postcode: { type: Number },
  lat:      { type: Number },
  long:     { type: Number },
  active:   { type: Boolean, default: true },
});

module.exports = mongoose.model('DistributionCentre', DistributionCentreSchema);
