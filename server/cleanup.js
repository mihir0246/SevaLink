require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Volunteer = require('./models/Volunteer');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected.');

    const userResult = await User.updateMany({ lastName: '.' }, { $set: { lastName: '' } });
    const volunteerResult = await Volunteer.updateMany({ lastName: '.' }, { $set: { lastName: '' } });

    console.log(`Cleaned ${userResult.modifiedCount} users.`);
    console.log(`Cleaned ${volunteerResult.modifiedCount} volunteers.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err.message);
    process.exit(1);
  }
}

run();
