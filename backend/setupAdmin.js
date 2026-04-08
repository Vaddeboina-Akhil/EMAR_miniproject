require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./src/models/Admin');

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@emar.com' });
    if (existingAdmin) {
      console.log('✅ Admin already exists with email: admin@emar.com');
      console.log(`   Password: admin@123`);
      await mongoose.disconnect();
      return;
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    const admin = await Admin.create({
      name: 'EMAR Admin',
      email: 'admin@emar.com',
      password: hashedPassword,
      verified: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: admin@emar.com`);
    console.log(`   Password: admin@123`);
    console.log(`   ID: ${admin._id}`);
    console.log(`\n🔐 Use /admin/login route to access admin dashboard`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupAdmin();
