const mongoose = require('mongoose');

// Mirrors OVP VolunteerActionProduct — join between action and product
const VolunteerActionProductSchema = new mongoose.Schema({
  volunteerActionId: { type: mongoose.Schema.Types.ObjectId, ref: 'VolunteerAction', required: true },
  productId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
});

module.exports = mongoose.model('VolunteerActionProduct', VolunteerActionProductSchema);
