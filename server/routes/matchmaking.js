const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Recipient = require('../models/Recipient');
const VolunteerAction = require('../models/VolunteerAction');
const VolunteerActionProduct = require('../models/VolunteerActionProduct');
const DailyActionPlan = require('../models/DailyActionPlan');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { matchVolunteersToRecipients } = require('../services/geminiMatchmakingService');

/**
 * POST /api/matchmaking/assign
 * Admin-only. Mirrors OVP's assignVolunteers mutation — enhanced with Gemini AI.
 *
 * Flow (direct port of OVP custom-resolvers.ts logic):
 * 1. Find all CREATED/ASSIGNED actions → collect busy volunteer/recipient IDs
 * 2. Find free volunteers (excluding busy ones)
 * 3. Find unassigned recipients
 * 4. Send both lists to Gemini AI for intelligent matching
 * 5. Create VolunteerAction + VolunteerActionProduct documents
 * 6. Return DailyActionPlan summary
 */
router.post('/assign', auth, requireRole('admin'), async (req, res) => {
  try {
    const now = new Date();
    const owner = req.user.firstName || req.user.email;

    // Step 1: Find ongoing actions (mirrors OVP buildQueryToFindAllItemsExcludingThoseWithGivenIds)
    const ongoingActions = await VolunteerAction.find({
      status: { $in: ['CREATED', 'ASSIGNED'] }
    });

    const busyVolunteerIds = ongoingActions.map(a => a.volunteerId?.toString()).filter(Boolean);
    const busyRecipientIds = ongoingActions.map(a => a.recipientId?.toString()).filter(Boolean);

    // Step 2: Find free volunteers
    const availableVolunteers = await Volunteer.find({
      active: true,
      ...(busyVolunteerIds.length ? { _id: { $nin: busyVolunteerIds } } : {}),
    });

    // Step 3: Find recipients without active actions
    const pendingRecipients = await Recipient.find({
      status: { $in: ['pending'] },
      ...(busyRecipientIds.length ? { _id: { $nin: busyRecipientIds } } : {}),
    });

    // Edge case: no volunteers or recipients
    if (availableVolunteers.length === 0 || pendingRecipients.length === 0) {
      const emptyPlan = await DailyActionPlan.create({
        owner,
        date: now,
        numberOfCasesCreated: 0,
        numberOfVolunteersAssigned: 0,
        numberOfRecipients: pendingRecipients.length,
        geminiSummary: 'No assignments made: insufficient volunteers or recipients.',
      });
      return res.json({ plan: emptyPlan, actions: [] });
    }

    // Step 4: Gemini AI matchmaking
    const matches = await matchVolunteersToRecipients(pendingRecipients, availableVolunteers);

    // Step 5: Create VolunteerAction documents for each match
    const createdActions = [];
    const usedVolunteerIds = new Set();

    for (const match of matches) {
      if (!match.volunteerId || !match.recipientId) continue;
      if (usedVolunteerIds.has(match.volunteerId)) continue;

      const recipient = pendingRecipients.find(r => r._id.toString() === match.recipientId);
      const volunteer = availableVolunteers.find(v => v._id.toString() === match.volunteerId);
      if (!recipient || !volunteer) continue;

      const action = await VolunteerAction.create({
        title: `Delivery to ${recipient.firstName} ${recipient.lastName}`,
        description: `${recipient.needType} assistance - ${recipient.preferredProducts || recipient.quantity || ''}`,
        status: 'ASSIGNED',
        urgency: recipient.urgency,
        category: recipient.needType,
        assignedAt: now,
        volunteerId: volunteer._id,
        recipientId: recipient._id,
        aiMatchScore: match.matchScore,
        aiMatchReason: match.reason,
        _createdAt: now,
      });

      // Find and link relevant products
      const products = await Product.find({
        category: recipient.needType,
        status: { $in: ['In Stock', 'Low Stock'] }
      }).limit(2);

      for (const product of products) {
        await VolunteerActionProduct.create({
          volunteerActionId: action._id,
          productId: product._id,
        });
      }

      // Update volunteer active count
      await Volunteer.findByIdAndUpdate(volunteer._id, { $inc: { actionsActive: 1 } });

      // Update recipient status and links
      await Recipient.findByIdAndUpdate(recipient._id, { 
        status: 'assigned',
        assignedTo: volunteer._id,
        assignedAction: action._id
      });

      usedVolunteerIds.add(match.volunteerId);
      createdActions.push(action);
    }

    // Step 6: Create DailyActionPlan (mirrors OVP exactly)
    const plan = await DailyActionPlan.create({
      owner,
      date: now,
      numberOfCasesCreated: createdActions.length,
      numberOfVolunteersAssigned: usedVolunteerIds.size,
      numberOfRecipients: pendingRecipients.length,
      geminiSummary: `AI assigned ${createdActions.length} volunteer actions across ${usedVolunteerIds.size} volunteers for ${pendingRecipients.length} pending community needs.`,
    });

    res.json({
      plan,
      actions: createdActions,
      message: `✅ Gemini AI created ${createdActions.length} assignments`,
    });
  } catch (err) {
    console.error('Matchmaking error:', err.message);
    res.status(500).json({ msg: 'Server error during AI matchmaking' });
  }
});

// GET /api/matchmaking/plans — list all daily action plans
router.get('/plans', auth, async (req, res) => {
  try {
    const plans = await DailyActionPlan.find().sort({ date: -1 }).limit(10);
    res.json(plans);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/matchmaking/candidates/:recipientId — get AI-suggested volunteers for a recipient
router.get('/candidates/:recipientId', auth, requireRole('admin'), async (req, res) => {
  try {
    const recipient = await Recipient.findById(req.params.recipientId);
    if (!recipient) return res.status(404).json({ msg: 'Recipient not found' });

    const volunteers = await Volunteer.find({ active: true });
    const matches = await matchVolunteersToRecipients([recipient], volunteers);

    // Enrich with full volunteer data
    const enriched = await Promise.all(
      matches.map(async m => {
        const vol = volunteers.find(v => v._id.toString() === m.volunteerId);
        return { ...m, volunteer: vol };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
