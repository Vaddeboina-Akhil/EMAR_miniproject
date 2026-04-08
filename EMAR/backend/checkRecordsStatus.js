const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Patient = require('./src/models/Patient');
const MedicalRecord = require('./src/models/MedicalRecord');

async function checkRecords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find Vaddeboina Akhil
    const patient = await Patient.findOne({ name: 'Vaddeboina Akhil' });
    if (!patient) {
      console.log('❌ Patient not found');
      return;
    }
    console.log('✅ Found patient:', patient.name, 'ID:', patient._id);

    // Check all records for this patient
    const allRecords = await MedicalRecord.find({ patientId: patient._id }).select('status createdAt patientId');
    console.log('\n📋 ALL RECORDS for patient:');
    console.table(allRecords.map(r => ({
      ID: r._id.toString(),
      Status: r.status,
      CreatedAt: r.createdAt
    })));

    // Check non-rejected records
    const nonRejected = await MedicalRecord.find({ 
      patientId: patient._id, 
      status: { $ne: 'rejected' } 
    }).select('status createdAt patientId');
    console.log('\n✅ NON-REJECTED RECORDS (status !== "rejected"):');
    console.log('Count:', nonRejected.length);
    console.table(nonRejected.map(r => ({
      ID: r._id.toString(),
      Status: r.status,
      CreatedAt: r.createdAt
    })));

    // Check approved records only
    const approved = await MedicalRecord.find({ 
      patientId: patient._id, 
      status: 'approved' 
    }).select('status createdAt patientId');
    console.log('\n✅ APPROVED RECORDS ONLY:');
    console.log('Count:', approved.length);
    console.table(approved.map(r => ({
      ID: r._id.toString(),
      Status: r.status,
      CreatedAt: r.createdAt
    })));

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkRecords();
