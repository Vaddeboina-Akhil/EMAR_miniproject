const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Doctor = require('./src/models/Doctor');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const setupDoctor = async () => {
  try {
    const doctor = await Doctor.findOne({ licenseId: 'MED1235' });
    
    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }
    
    // Set password to "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);
    doctor.password = hashedPassword;
    await doctor.save();
    
    console.log('✅ AVK ABHIRAMA PRANEETH Setup Complete!');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('   License ID: MED1235');
    console.log('   Password:  123456');
    console.log('');
    console.log('Go to: http://localhost:3001/login');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

connectDB().then(setupDoctor);
