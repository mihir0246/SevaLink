const express = require('express');
const router = express.Router();
const Recipient = require('../models/Recipient');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// Helper to geocode addresses via OpenStreetMap Nominatim
async function geocodeAddress(city, address1) {
  if (!city) return null;
  const searchStr = `${address1 ? address1 + ', ' : ''}${city}`;
  try {
    const urlFull = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchStr)}`;
    let response = await fetch(urlFull, { headers: { 'User-Agent': 'SevaLink_Geocoding/1.0' } });
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), long: parseFloat(data[0].lon) };
    }

    // Fallback: Try just the city if the exact address fails
    const urlCity = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`;
    response = await fetch(urlCity, { headers: { 'User-Agent': 'SevaLink_Geocoding/1.0' } });
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), long: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error('Backend Geocoding Error:', err.message);
  }
  return null;
}

// GET /api/recipients — list all (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { type, urgency, status, search } = req.query;
    let query = {};
    if (type && type !== 'all') query.needType = type;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { householdId: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
      ];
    }
    const recipients = await Recipient.find(query)
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(recipients);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/recipients/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Recipient.countDocuments();
    const pending = await Recipient.countDocuments({ status: 'pending' });
    const inProgress = await Recipient.countDocuments({ status: 'in-progress' });
    const completed = await Recipient.countDocuments({ status: 'completed' });
    const urgent = await Recipient.countDocuments({ urgency: { $in: ['high', 'critical'] } });
    res.json({ total, pending, inProgress, completed, urgent });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/recipients — admin adds a community need
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const coords = await geocodeAddress(req.body.city, req.body.address1);
    const recipient = new Recipient({
      ...req.body,
      lat: coords ? coords.lat : req.body.lat,
      long: coords ? coords.long : req.body.long
    });
    await recipient.save();
    res.status(201).json(recipient);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/recipients/:id — update need
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.city || updateData.address1) {
      const recipientToUpdate = await Recipient.findById(req.params.id);
      if (recipientToUpdate) {
        const coords = await geocodeAddress(
          updateData.city || recipientToUpdate.city,
          updateData.address1 || recipientToUpdate.address1
        );
        if (coords) {
          updateData.lat = coords.lat;
          updateData.long = coords.long;
        }
      }
    }
    const recipient = await Recipient.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignedTo', 'firstName lastName');
    if (!recipient) return res.status(404).json({ msg: 'Recipient not found' });
    res.json(recipient);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/recipients/:id — remove need
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const recipient = await Recipient.findByIdAndDelete(req.params.id);
    if (!recipient) return res.status(404).json({ msg: 'Recipient not found' });
    
    // Also remove any linked actions if they exist
    const VolunteerAction = require('../models/VolunteerAction');
    await VolunteerAction.deleteMany({ recipientId: req.params.id });
    
    res.json({ msg: 'Recipient and linked actions removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
