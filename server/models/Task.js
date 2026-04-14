const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  status: { type: String, default: 'Open' }, // Open, Assigned, Completed
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }
});

module.exports = mongoose.model('Task', TaskSchema);
