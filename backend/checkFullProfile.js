const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('./src/models/Doctor');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const check = async () => {
  try {
    const doctor = await Doctor.findOne({ licenseId: 'MED1235' });
    
    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }
    
    console.log('Doctor object keys:', Object.keys(doctor.toObject()));
    console.log('');
    console.log('profileImage exists?', !!doctor.profileImage);
    console.log('profileImage value:', doctor.profileImage ? 'HAS VALUE' : 'NULL/UNDEFINED');
    
    if (doctor.profileImage) {
      const str = String(doctor.profileImage);
      console.log('Type:', typeof doctor.profileImage);
      console.log('Length:', str.length);
      console.log('Starts with:', str.substring(0, 30));
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

connectDB().then(check);
