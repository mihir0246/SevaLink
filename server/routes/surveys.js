const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractSurveyData } = require('../services/extractionService');
const Recipient = require('../models/Recipient');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Configure multer for memory storage
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  storage: multer.memoryStorage()
});

/**
 * @route   POST /api/surveys/extract
 * @desc    Upload an image/PDF/File and return AI-extracted JSON
 * @access  Admin Only
 */
router.post('/extract', [auth, roleCheck('admin'), upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const extractionResult = await extractSurveyData(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    res.json(extractionResult);
  } catch (err) {
    console.error('Extraction Route Error:', err.message);
    res.status(500).json({ msg: err.message || 'Error processing survey file' });
  }
});

/**
 * @route   POST /api/surveys/confirm
 * @desc    Save the confirmed extracted data as a new Recipient
 * @access  Admin Only
 */
router.post('/confirm', [auth, roleCheck('admin')], async (req, res) => {
  try {
    const { 
      name, 
      householdId, 
      city, 
      area, 
      coordinates,
      needType, 
      quantity, 
      urgency, 
      notes, 
      metadata 
    } = req.body;

    // Parse coordinates if available (format expected: "lat, long")
    let lat = null;
    let long = null;
    if (coordinates && coordinates.includes(',')) {
      const parts = coordinates.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        lat = parts[0];
        long = parts[1];
      }
    }

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const newRecipient = new Recipient({
      firstName,
      lastName,
      city,
      address1: area,
      householdId,
      lat,
      long,
      needType,
      quantity,
      urgency,
      preferredProducts: needType,
      metadata: { ...metadata, notes },
      status: 'pending'
    });

    await newRecipient.save();
    res.json(newRecipient);
  } catch (err) {
    console.error('Confirm Survey Error:', err.message);
    res.status(500).json({ msg: 'Error saving survey data' });
  }
});

module.exports = router;
