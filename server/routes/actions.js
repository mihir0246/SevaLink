const express = require('express');
const router = express.Router();
const VolunteerAction = require('../models/VolunteerAction');
const Volunteer = require('../models/Volunteer');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

// GET /api/actions — list all actions (filterable)
router.get('/', auth, async (req, res) => {
  try {
    const { status, volunteerId, recipientId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (volunteerId) query.volunteerId = volunteerId;
    if (recipientId) query.recipientId = recipientId;

    const actions = await VolunteerAction.find(query)
      .populate('volunteerId', 'firstName lastName email skills rating')
      .populate('recipientId', 'firstName lastName city needType urgency')
      .populate('distributionCentreId', 'name city')
      .sort({ _createdAt: -1 });

    res.json(actions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/actions/stats — dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalActions = await VolunteerAction.countDocuments();
    const created = await VolunteerAction.countDocuments({ status: 'CREATED' });
    const assigned = await VolunteerAction.countDocuments({ status: 'ASSIGNED' });
    const completed = await VolunteerAction.countDocuments({ status: 'COMPLETED' });
    const urgent = await VolunteerAction.countDocuments({ urgency: { $in: ['high', 'critical'] } });
    const activeVolunteers = await Volunteer.countDocuments({ active: true });

    // Needs by category
    const needsByCategory = await VolunteerAction.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    res.json({ totalActions, created, assigned, completed, urgent, activeVolunteers, needsByCategory });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/actions/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const action = await VolunteerAction.findById(req.params.id)
      .populate('volunteerId')
      .populate('recipientId')
      .populate('distributionCentreId');
    if (!action) return res.status(404).json({ msg: 'Action not found' });
    res.json(action);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/actions/:id/status — update status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['CREATED', 'ASSIGNED', 'PENDING_VERIFICATION', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }

    const update = { status };
    if (status === 'ASSIGNED') update.assignedAt = new Date();
    if (status === 'COMPLETED' || status === 'PENDING_VERIFICATION') update.completedAt = new Date();

    const action = await VolunteerAction.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('volunteerId', 'firstName lastName')
      .populate('recipientId', 'firstName lastName');

    if (!action) return res.status(404).json({ msg: 'Action not found' });

    // Sync status with recipient
    const recipientStatusMap = {
      'ASSIGNED': 'assigned',
      'PENDING_VERIFICATION': 'pending-verification',
      'COMPLETED': 'completed'
    };
    if (recipientStatusMap[status]) {
      const Recipient = require('../models/Recipient');
      await Recipient.findByIdAndUpdate(action.recipientId._id, { status: recipientStatusMap[status] });
    }

    // Update volunteer counters only on true completion (or if moved out of assigned)
    if (status === 'COMPLETED' && action.volunteerId) {
      await Volunteer.findByIdAndUpdate(action.volunteerId._id, {
        $inc: { actionsCompleted: 1, actionsActive: -1 }
      });
    }

    res.json(action);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/actions/:id/verify — Admin final verification
router.post('/:id/verify', auth, requireRole('admin'), async (req, res) => {
  try {
    const action = await VolunteerAction.findById(req.params.id);
    if (!action) return res.status(404).json({ msg: 'Action not found' });

    action.status = 'COMPLETED';
    action.completedAt = action.completedAt || new Date();
    await action.save();

    // Finalize recipient
    const Recipient = require('../models/Recipient');
    await Recipient.findByIdAndUpdate(action.recipientId, { status: 'completed' });

    // Update volunteer counters
    if (action.volunteerId) {
      await Volunteer.findByIdAndUpdate(action.volunteerId, {
        $inc: { actionsCompleted: 1, actionsActive: -1 }
      });
    }

    res.json({ msg: 'Volunteer action verified and completed', action });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/actions — create a single action manually
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const action = new VolunteerAction(req.body);
    await action.save();

    // Link to recipient
    const Recipient = require('../models/Recipient');
    await Recipient.findByIdAndUpdate(req.body.recipientId, {
      status: 'assigned',
      assignedTo: req.body.volunteerId,
      assignedAction: action._id
    });

    res.status(201).json(action);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
