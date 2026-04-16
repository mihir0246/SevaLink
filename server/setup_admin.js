require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sevalink';

async function setupAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Remove all users with role 'admin'
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`Deleted ${deleteResult.deletedCount} existing admin(s).`);

    // Create the single admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin@123', salt);

    const adminUser = new User({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      username: 'admin_' + Date.now(),
    });

    await adminUser.save();
    console.log('Successfully created admin@gmail.com with password admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
