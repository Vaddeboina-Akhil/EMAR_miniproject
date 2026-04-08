const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Patient = require('./src/models/Patient');
const MedicalRecord = require('./src/models/MedicalRecord');

async function checkByEmarId() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Search by EMAR ID
    const patientEmarId = 'EMAR-P-2932';
    console.log(`🔍 Searching for patient with EMAR ID: ${patientEmarId}\n`);

    const patient = await Patient.findOne({ patientId: patientEmarId });
    
    if (!patient) {
      console.log('❌ Patient not found with EMAR ID:', patientEmarId);
      return;
    }

    console.log('✅ Found patient:');
    console.log('  Name:', patient.name);
    console.log('  EMAR ID:', patient.patientId);
    console.log('  MongoDB ID:', patient._id.toString());

    // Count records with different statuses
    console.log('\n📋 MEDICAL RECORDS BREAKDOWN:');
    
    const total = await MedicalRecord.countDocuments({ patientId: patient._id });
    console.log('Total records:', total);

    const approved = await MedicalRecord.countDocuments({ 
      patientId: patient._id, 
      status: 'approved' 
    });
    console.log('Approved:', approved);

    const pending = await MedicalRecord.countDocuments({ 
      patientId: patient._id, 
      status: 'pending' 
    });
    console.log('Pending:', pending);

    const rejected = await MedicalRecord.countDocuments({ 
      patientId: patient._id, 
      status: 'rejected' 
    });
    console.log('Rejected:', rejected);

    const nonRejected = await MedicalRecord.countDocuments({ 
      patientId: patient._id, 
      status: { $ne: 'rejected' }
    });
    console.log('Non-rejected (what should show):', nonRejected);

    // List all records
    console.log('\n📋 ALL RECORDS FOR THIS PATIENT:');
    const allRecords = await MedicalRecord.find({ patientId: patient._id }).select('_id status createdAt');
    allRecords.forEach((r, i) => {
      console.log(`  ${i + 1}. Status: ${r.status}, Created: ${r.createdAt}`);
    });

    console.log('\n✅ EXPECTED DISPLAY: Records count should be', nonRejected);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkByEmarId();
