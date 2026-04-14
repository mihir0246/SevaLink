/**
 * SevaLink seed data — adapted from OVP mongodump/showcase/
 * Run with: node seed/seedData.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Recipient = require('../models/Recipient');
const DistributionCentre = require('../models/DistributionCentre');
const Product = require('../models/Product');
const VolunteerAction = require('../models/VolunteerAction');

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('🌱 Connected to MongoDB, seeding data...');

  // Clear existing
  await Promise.all([
    User.deleteMany(), Volunteer.deleteMany(), Recipient.deleteMany(),
    DistributionCentre.deleteMany(), Product.deleteMany(), VolunteerAction.deleteMany(),
  ]);

  // ── Users & Volunteers ──────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const hash = async (pw) => bcrypt.hash(pw, salt);

  const adminUser = await User.create({
    firstName: 'Admin', lastName: 'SevaLink',
    email: 'admin@sevalink.org', password: await hash('admin123'),
    role: 'admin', username: 'admin_sevalink',
  });

  const volunteerData = [
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', skills: ['Logistics', 'Driving', 'Organization'], city: 'Mumbai', rating: 4.8, actionsCompleted: 47 },
    { firstName: 'Michael', lastName: 'Chen', email: 'mchen@email.com', skills: ['Medical', 'First Aid', 'Transport'], city: 'Mumbai', rating: 4.9, actionsCompleted: 38 },
    { firstName: 'Emma', lastName: 'Davis', email: 'emma.d@email.com', skills: ['Cooking', 'Hygiene', 'Teaching'], city: 'Mumbai', rating: 4.7, actionsCompleted: 52 },
    { firstName: 'James', lastName: 'Wilson', email: 'jwilson@email.com', skills: ['Construction', 'Safety', 'Carpentry'], city: 'Andheri', rating: 4.9, actionsCompleted: 61 },
    { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@email.com', skills: ['Medical', 'Counseling', 'Teaching'], city: 'Kurla', rating: 4.6, actionsCompleted: 29 },
  ];

  for (const vd of volunteerData) {
    const user = await User.create({
      firstName: vd.firstName, lastName: vd.lastName,
      email: vd.email, password: await hash('volunteer123'),
      role: 'volunteer', username: vd.email.split('@')[0],
    });
    await Volunteer.create({ ...vd, userId: user._id, canDeliver: true, active: true });
  }

  // ── Distribution Centres (from OVP seed) ───────────────────────────────────
  const centres = await DistributionCentre.insertMany([
    { name: 'North District Hub', address1: '12 Relief Road', city: 'Mumbai', postcode: 400001, lat: 19.0760, long: 72.8777, active: true },
    { name: 'Dharavi Centre', address1: '5 KK Nagar', city: 'Dharavi', postcode: 400017, lat: 19.0440, long: 72.8497, active: true },
    { name: 'Kurla East Centre', address1: 'LBS Marg', city: 'Kurla', postcode: 400070, lat: 19.0641, long: 72.8863, active: true },
  ]);

  // ── Products (adapted from OVP showcase) ───────────────────────────────────
  await Product.insertMany([
    { label: 'Food Package', description: 'Weekly family food supply', category: 'Food', distributionCentreId: centres[0]._id, quantity: 450, unit: 'boxes', status: 'In Stock' },
    { label: 'Medical Kit', description: 'Basic first aid and medicine', category: 'Medical', distributionCentreId: centres[1]._id, quantity: 87, unit: 'kits', status: 'Low Stock' },
    { label: 'Blanket Set', description: 'Emergency shelter blankets', category: 'Shelter', distributionCentreId: centres[0]._id, quantity: 312, unit: 'pieces', status: 'In Stock' },
    { label: 'Education Kit', description: 'School supplies for children', category: 'Education', distributionCentreId: centres[2]._id, quantity: 120, unit: 'kits', status: 'In Stock' },
    { label: 'First Aid Supplies', description: 'Emergency first aid', category: 'Medical', distributionCentreId: centres[2]._id, quantity: 45, unit: 'kits', status: 'Critical' },
  ]);

  // ── Recipients (community needs) ───────────────────────────────────────────
  await Recipient.insertMany([
    { firstName: 'Rajesh', lastName: 'Kumar', householdId: 'HH-2026-1847', city: 'Dharavi', address1: 'Zone 3', phone: '9876543210', needType: 'Food', urgency: 'high', preferredProducts: 'Food Package', status: 'pending' },
    { firstName: 'Priya', lastName: 'Sharma', householdId: 'HH-2026-1848', city: 'Kurla', address1: 'Kurla West', phone: '9876543211', needType: 'Medical', urgency: 'critical', preferredProducts: 'Medical Kit', status: 'pending' },
    { firstName: 'Mohammed', lastName: 'Ali', householdId: 'HH-2026-1849', city: 'Bandra', address1: 'Bandra East', phone: '9876543212', needType: 'Shelter', urgency: 'medium', preferredProducts: 'Blanket Set', status: 'pending' },
    { firstName: 'Sunita', lastName: 'Patel', householdId: 'HH-2026-1850', city: 'Andheri', address1: 'Andheri West', phone: '9876543213', needType: 'Education', urgency: 'low', preferredProducts: 'Education Kit', status: 'pending' },
    { firstName: 'Amit', lastName: 'Desai', householdId: 'HH-2026-1851', city: 'Goregaon', address1: 'Goregaon East', phone: '9876543214', needType: 'Food', urgency: 'high', preferredProducts: 'Food Package', status: 'pending' },
  ]);

  console.log('✅ Seed complete!');
  console.log('   Admin login:     admin@sevalink.org / admin123');
  console.log('   Volunteer login: sarah.j@email.com / volunteer123');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
