const mongoose = require('mongoose');
require('dotenv').config();

const Consent = require('./src/models/Consent');
const Patient = require('./src/models/Patient');
const Doctor = require('./src/models/Doctor');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const setup = async () => {
  try {
    // Get AVK ABHIRAMA PRANEETH doctor
    const doctor = await Doctor.findOne({ name: { $regex: 'abhirama|praneeth', $options: 'i' } });
    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }
    
    // Get Vaddeboina Akhil patient
    const patient = await Patient.findOne({ name: { $regex: 'vaddeboina', $options: 'i' } });
    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }
    
    // Delete existing consent between these two
    await Consent.deleteMany({ doctorId: doctor._id, patientId: patient._id });
    
    // Create new consent
    const consent = await Consent.create({
      doctorId: doctor._id,
      patientId: patient._id,
      doctorName: doctor.name,
      hospitalName: doctor.hospitalName,
      reason: 'Patient medical check',
      status: 'approved',
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      responseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    
    console.log('✅ Created consent:');
    console.log('   Doctor: ' + doctor.name);
    console.log('   Patient: ' + patient.name);
    console.log('   Status: approved');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

connectDB().then(setup);
