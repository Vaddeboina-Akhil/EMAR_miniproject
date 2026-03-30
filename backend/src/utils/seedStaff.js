const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Staff = require('../models/Staff');

const staffAccounts = [
  {
    name: 'Priya Sharma',
    staffId: 'ST-001',
    hospitalName: 'Apollo Hospital',
    email: 'priya.sharma@apollo.com',
    phone: '9876543001',
    password: 'Staff@123',
    role: 'staff'
  },
  {
    name: 'Ravi Kumar',
    staffId: 'ST-002',
    hospitalName: 'Apollo Hospital',
    email: 'ravi.kumar@apollo.com',
    phone: '9876543002',
    password: 'Staff@123',
    role: 'staff'
  },
  {
    name: 'Anjali Reddy',
    staffId: 'ST-003',
    hospitalName: 'KIMS Hospital',
    email: 'anjali.reddy@kims.com',
    phone: '9876543003',
    password: 'Staff@123',
    role: 'staff'
  },
  {
    name: 'Suresh Babu',
    staffId: 'ST-004',
    hospitalName: 'Yashoda Hospital',
    email: 'suresh.babu@yashoda.com',
    phone: '9876543004',
    password: 'Staff@123',
    role: 'staff'
  },
  {
    name: 'Neha Singh',
    staffId: 'ST-005',
    hospitalName: 'Rainbow Hospital',
    email: 'neha.singh@rainbowhospital.com',
    phone: '9876543005',
    password: 'Staff@123',
    role: 'staff'
  }
];

const seedStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const account of staffAccounts) {
      const exists = await Staff.findOne({ staffId: account.staffId });
      if (exists) {
        console.log(`⚠️  Staff ${account.staffId} already exists — skipping`);
        continue;
      }
      const hashed = await bcrypt.hash(account.password, 10);
      await Staff.create({ ...account, password: hashed });
      console.log(`✅ Created: ${account.name} (${account.staffId}) — ${account.hospitalName}`);
    }

    console.log('\n🎉 Seeding complete! Staff accounts ready.\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LOGIN CREDENTIALS (use at /hospital-staff-portal)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    staffAccounts.forEach(s => {
      console.log(`Staff ID : ${s.staffId}`);
      console.log(`Password : ${s.password}`);
      console.log(`Hospital : ${s.hospitalName}`);
      console.log('──────────────────────────────────────');
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedStaff();