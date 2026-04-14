const express = require('express');
const router = express.Router();
const DistributionCentre = require('../models/DistributionCentre');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// GET /api/distribution-centres
router.get('/', auth, async (req, res) => {
  try {
    const centres = await DistributionCentre.find({ active: true });
    res.json(centres);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/distribution-centres
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const centre = new DistributionCentre(req.body);
    await centre.save();
    res.status(201).json(centre);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
