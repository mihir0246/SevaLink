const mongoose = require('mongoose');

// Mirrors OVP Product type
const ProductSchema = new mongoose.Schema({
  label:                 { type: String, required: true },
  description:           { type: String },
  distributionCentreId:  { type: mongoose.Schema.Types.ObjectId, ref: 'DistributionCentre' },
  category:              { type: String, enum: ['Food', 'Medical', 'Shelter', 'Education', 'Other'] },
  quantity:              { type: Number, default: 0 },
  unit:                  { type: String },
  status:                { type: String, enum: ['In Stock', 'Low Stock', 'Critical'], default: 'In Stock' },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
