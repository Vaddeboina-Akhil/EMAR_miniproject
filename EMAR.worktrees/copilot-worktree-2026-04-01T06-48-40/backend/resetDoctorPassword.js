const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Doctor = require('./src/models/Doctor');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const resetPassword = async () => {
  try {
    const doctor = await Doctor.findOne({ licenseId: 'MED1235' });
    
    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }
    
    // Hash password "Bharati"
    const hashedPassword = await bcrypt.hash('Bharati', 10);
    doctor.password = hashedPassword;
    await doctor.save();
    
    console.log('✅ Password Reset Successfully!');
    console.log('');
    console.log('📝 Login Now With:');
    console.log('   License ID: MED1235');
    console.log('   Password:  Bharati');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

connectDB().then(resetPassword);
