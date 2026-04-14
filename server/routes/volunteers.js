const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const VolunteerAction = require('../models/VolunteerAction');
const config = require('../config/config');
const { matchVolunteersToRecipients } = require('../services/geminiMatchmakingService');
const Recipient = require('../models/Recipient');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// GET /api/volunteers — list all volunteers
router.get('/', auth, async (req, res) => {
  try {
    const { all } = req.query;
    const filter = (all === 'true' && req.user.role === 'admin') ? {} : { active: true };
    const volunteers = await Volunteer.find(filter).sort({ joinedDate: -1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/volunteers/:id — get a single volunteer with their active tasks
router.get('/:id', auth, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ msg: 'Volunteer not found' });

    const currentTasks = await VolunteerAction.find({
      volunteerId: volunteer._id,
      status: { $in: ['CREATED', 'ASSIGNED'] }
    }).populate('recipientId', 'firstName lastName city');

    res.json({ ...volunteer.toObject(), currentTasks });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/volunteers — admin creates a volunteer profile manually
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.status(201).json(volunteer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/volunteers/:id — update volunteer
router.patch('/:id', auth, async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!volunteer) return res.status(404).json({ msg: 'Volunteer not found' });
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/volunteers/stats/summary
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const total = await Volunteer.countDocuments({ active: true });
    const activeTasks = await VolunteerAction.countDocuments({ status: { $in: ['CREATED', 'ASSIGNED'] } });
    const totalCompleted = await VolunteerAction.countDocuments({ status: 'COMPLETED' });
    const volunteers = await Volunteer.find({ active: true }).select('rating');
    const avgRating = volunteers.length
      ? (volunteers.reduce((sum, v) => sum + v.rating, 0) / volunteers.length).toFixed(1)
      : 0;
    res.json({ total, activeTasks, totalCompleted, avgRating });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/volunteers/:id/toggle-active — activate/deactivate
router.patch('/:id/toggle-active', auth, requireRole('admin'), async (req, res) => {
  console.log(`[Volunteer] Toggling status for ${req.params.id}`);
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) return res.status(404).json({ msg: 'Volunteer not found' });

    volunteer.active = !volunteer.active;
    await volunteer.save();

    let reassignmentSummary = [];

    // If deactivating, unassign and re-run AI matching for their tasks
    if (!volunteer.active) {
      const actionsToReassign = await VolunteerAction.find({
        volunteerId: volunteer._id,
        status: 'ASSIGNED'
      });

      if (actionsToReassign.length > 0) {
        const recipientIds = actionsToReassign.map(a => a.recipientId);
        
        // 1. Reset actions and recipients
        await VolunteerAction.updateMany(
          { _id: { $in: actionsToReassign.map(a => a._id) } },
          { $set: { status: 'CREATED', volunteerId: null, assignedAt: null } }
        );
        await Recipient.updateMany(
          { _id: { $in: recipientIds } },
          { $set: { status: 'pending', assignedTo: null, assignedAction: null } }
        );

        // 2. Trigger AI reassignment for these specific recipients
        const pendingRecipients = await Recipient.find({ _id: { $in: recipientIds } });
        const busyActions = await VolunteerAction.find({ status: { $in: ['CREATED', 'ASSIGNED'] } });
        const busyVolunteerIds = busyActions.map(a => a.volunteerId?.toString()).filter(Boolean);
        
        const availableVolunteers = await Volunteer.find({
          active: true,
          _id: { $nin: [volunteer._id, ...busyVolunteerIds] }
        });

        if (availableVolunteers.length > 0) {
          const matches = await matchVolunteersToRecipients(pendingRecipients, availableVolunteers);
          
          for (const match of matches) {
            const recipient = pendingRecipients.find(r => r._id.toString() === match.recipientId);
            const newVol = availableVolunteers.find(v => v._id.toString() === match.volunteerId);
            if (!recipient || !newVol) continue;

            const existingAction = actionsToReassign.find(a => a.recipientId.toString() === match.recipientId);
            if (!existingAction) continue;
            
            await VolunteerAction.findByIdAndUpdate(existingAction._id, {
              status: 'ASSIGNED',
              volunteerId: newVol._id,
              assignedAt: new Date(),
              aiMatchScore: match.matchScore,
              aiMatchReason: `Reassigned from ${volunteer.firstName} (deactivated): ${match.reason}`
            });

            await Recipient.findByIdAndUpdate(recipient._id, {
              status: 'assigned',
              assignedTo: newVol._id
            });

            await Volunteer.findByIdAndUpdate(newVol._id, { $inc: { actionsActive: 1 } });
            reassignmentSummary.push(`${recipient.firstName}'s case reassigned to ${newVol.firstName}`);
          }
        }

        // Reset the deactivated volunteer's active count
        volunteer.actionsActive = 0;
        await volunteer.save();
      }
    }

    res.json({ 
      msg: `Volunteer ${volunteer.active ? 'activated' : 'deactivated'}`, 
      volunteer,
      reassignmentSummary 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during toggle-active' });
  }
});

module.exports = router;

