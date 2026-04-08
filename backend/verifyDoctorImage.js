require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./src/models/Doctor');

async function verifyDoctorImage() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Check MED1235 specifically
    const doctor = await Doctor.findOne({ licenseId: 'MED1235' });
    
    if (!doctor) {
      console.error('❌ Doctor MED1235 not found');
      await mongoose.disconnect();
      return;
    }

    console.log('📋 Doctor Record:');
    console.log(`   Name: ${doctor.name}`);
    console.log(`   License ID: ${doctor.licenseId}`);
    console.log(`   profileImage exists: ${!!doctor.profileImage}`);
    
    if (doctor.profileImage) {
      console.log(`   profileImage type: ${typeof doctor.profileImage}`);
      console.log(`   profileImage length: ${doctor.profileImage.length} characters`);
      console.log(`   First 100 chars: ${doctor.profileImage.substring(0, 100)}`);
      console.log(`\n✅ IMAGE IS STORED IN DATABASE`);
    } else {
      console.log(`\n❌ IMAGE IS NULL - NOT STORED`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyDoctorImage();
