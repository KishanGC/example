/**
 * Seed Script — Leftovers to Life
 * Creates demo users (donor, NGO, admin) and sample donations
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const Donation = require('./models/Donation');

const DEMO_USERS = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    phone: '+91 9000000001',
    organization: 'Leftovers to Life Admin',
    address: 'New Delhi, India',
    location: { lat: 28.6139, lng: 77.209 },
  },
  {
    name: 'Ravi Kumar',
    email: 'donor@demo.com',
    password: 'demo1234',
    role: 'donor',
    phone: '+91 9876543210',
    organization: 'Ravi\'s Restaurant',
    address: 'Connaught Place, New Delhi',
    location: { lat: 28.6330, lng: 77.2198 },
  },
  {
    name: 'Priya Sharma',
    email: 'donor2@demo.com',
    password: 'demo1234',
    role: 'donor',
    phone: '+91 9812345678',
    organization: 'Hotel Crown Palace',
    address: 'Karol Bagh, New Delhi',
    location: { lat: 28.6518, lng: 77.1907 },
  },
  {
    name: 'Meena Das',
    email: 'donor3@demo.com',
    password: 'demo1234',
    role: 'donor',
    phone: '+91 9988776655',
    organization: 'Home Kitchen',
    address: 'Lajpat Nagar, New Delhi',
    location: { lat: 28.5706, lng: 77.2433 },
  },
  {
    name: 'Hunger Free India',
    email: 'ngo@demo.com',
    password: 'demo1234',
    role: 'ngo',
    phone: '+91 9111111111',
    organization: 'Hunger Free India Foundation',
    address: 'Nehru Place, New Delhi',
    location: { lat: 28.5484, lng: 77.2529 },
  },
  {
    name: 'Annadaan Trust',
    email: 'ngo2@demo.com',
    password: 'demo1234',
    role: 'ngo',
    phone: '+91 9222222222',
    organization: 'Annadaan Trust',
    address: 'Dwarka, New Delhi',
    location: { lat: 28.5921, lng: 77.0460 },
  },
];

const FOOD_TYPES = ['cooked', 'packaged', 'raw', 'organic_waste', 'mixed'];
const STATUSES   = ['available', 'available', 'available', 'accepted', 'completed'];
const ADDRESSES  = [
  'Near Rajiv Chowk Metro, New Delhi',
  'Saket District Centre, New Delhi',
  'Chandni Chowk Market, Old Delhi',
  'Greater Kailash-I, New Delhi',
  'Rohini Sector 9, New Delhi',
  'Janakpuri District Centre, New Delhi',
];
const LATS = [28.6340, 28.5247, 28.6567, 28.5500, 28.7323, 28.6215];
const LNGS = [77.2195, 77.2133, 77.2310, 77.2412, 77.1204, 77.0882];
const QUANTITIES = ['20 portions', '5 kg', '3 boxes', '50 plates', '10 kg', '8 packets'];
const DESCRIPTIONS = [
  'Dal rice and sabzi — freshly cooked this morning',
  'Sealed packaged snacks — unused from event',
  'Raw vegetables from wedding function',
  'Mixed organic kitchen waste from restaurant',
  'Biryani and curry — sufficient for 30 people',
  'Bread, biscuits and juice cartons',
];

async function seed() {
  console.log('🌱 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected!');

  // Clear existing data
  await User.deleteMany({});
  await Donation.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create users (bcrypt done via pre-save hook in model)
  const createdUsers = await User.create(DEMO_USERS);
  console.log(`👥 Created ${createdUsers.length} users`);

  const donors = createdUsers.filter(u => u.role === 'donor');
  const ngos   = createdUsers.filter(u => u.role === 'ngo');

  // Create donations
  const donations = [];
  for (let i = 0; i < 12; i++) {
    const donor   = donors[i % donors.length];
    const status  = STATUSES[i % STATUSES.length];
    const ngo     = ngos[i % ngos.length];
    const isOrg   = i % 4 === 0;

    donations.push({
      donor:      donor._id,
      acceptedBy: ['accepted', 'completed'].includes(status) ? ngo._id : null,
      foodType:   FOOD_TYPES[i % FOOD_TYPES.length],
      quantity:   QUANTITIES[i % QUANTITIES.length],
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      address:    ADDRESSES[i % ADDRESSES.length],
      location:   { lat: LATS[i % LATS.length], lng: LNGS[i % LNGS.length] },
      expiresAt:  new Date(Date.now() + (i % 5 + 1) * 3600000 * 4),
      status,
      isOrganic:  isOrg,
    });
  }

  await Donation.insertMany(donations);
  console.log(`🍱 Created ${donations.length} sample donations`);

  console.log('\n✅ Seed complete! Demo accounts:');
  console.log('─────────────────────────────────────────');
  console.log('🛡️  Admin:  admin@demo.com / demo1234');
  console.log('🍽️  Donor:  donor@demo.com / demo1234');
  console.log('🏢  NGO:    ngo@demo.com   / demo1234');
  console.log('─────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
