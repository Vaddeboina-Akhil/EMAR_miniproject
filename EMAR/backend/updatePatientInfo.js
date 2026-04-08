require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./src/models/Patient');

const connectDB = require('./src/config/db');

async function updatePatientInfo() {
  try {
    await connectDB();
    console.log('🔗 Connected to MongoDB');

    // Find Vaddeboina Akhil's patient record
    const patient = await Patient.findOne({ name: { $regex: 'Vaddeboina', $options: 'i' } });
    
    if (!patient) {
      console.log('❌ Patient not found with name Vaddeboina');
      return;
    }

    console.log(`\n📋 Found Patient: ${patient.name} (${patient.patientId})`);
    console.log(`Current Data:
      - Name: ${patient.name}
      - Blood Group: ${patient.bloodGroup || 'NOT SET'}
      - Guardian Contact: ${patient.guardianContact || 'NOT SET'}
      - Allergies: ${patient.allergies || 'NOT SET'}
      - Profile Image: ${patient.profileImage ? 'YES (set)' : 'NOT SET'}
    `);

    // Update patient with missing information
    patient.bloodGroup = patient.bloodGroup || 'O-';
    patient.guardianContact = patient.guardianContact || '9290490999';
    patient.allergies = patient.allergies || 'Skin Allergie';
    
    // If no profile image, add a placeholder or note
    if (!patient.profileImage) {
      console.log('\n⚠️  Profile Image not set. To add image:');
      console.log('   - Use the Edit Profile page in patient dashboard');
      console.log('   - Upload image and save');
    }

    await patient.save();
    console.log(`\n✅ Patient Updated Successfully!`);
    console.log(`New Data:
      - Name: ${patient.name}
      - Blood Group: ${patient.bloodGroup}
      - Guardian Contact: ${patient.guardianContact}
      - Allergies: ${patient.allergies}
    `);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePatientInfo();
