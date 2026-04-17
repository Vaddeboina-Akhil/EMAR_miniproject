require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Doctor = require('./src/models/Doctor');

async function updateDoctorProfileImage() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Read the doctor profile image
    const imagePath = 'C:\\Users\\akhil\\Downloads\\EMAR\\EMAR\\frontend\\public\\images\\Abhiram.jpg';
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Image file not found:', imagePath);
      await mongoose.disconnect();
      return;
    }

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    console.log('📸 Image converted to base64');
    console.log(`   - Size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Update doctor record
    const doctor = await Doctor.findOneAndUpdate(
      { licenseId: 'MED1235' },
      { profileImage: dataUrl },
      { new: true }
    );

    if (!doctor) {
      console.error('❌ Doctor not found');
      await mongoose.disconnect();
      return;
    }

    console.log('✅ Doctor profile image updated!');
    console.log(`   - Name: ${doctor.name}`);
    console.log(`   - License: ${doctor.licenseId}`);
    console.log(`   - Image size: ${(doctor.profileImage.length / 1024).toFixed(2)} KB`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateDoctorProfileImage();
