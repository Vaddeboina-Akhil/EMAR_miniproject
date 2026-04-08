const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Doctor = require('./src/models/Doctor');
const Patient = require('./src/models/Patient');
const Consent = require('./src/models/Consent');

async function checkConsent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the doctor (AVK. ABHIRAMA PRANEETH)
    const doctor = await Doctor.findOne({ name: 'AVK. ABHIRAMA PRANEETH' });
    if (!doctor) {
      console.log('❌ Doctor not found');
      return;
    }
    console.log('✅ Found doctor:', doctor.name, 'ID:', doctor._id);

    // Find the patient
    const patient = await Patient.findOne({ name: 'Vaddeboina Akhil' });
    if (!patient) {
      console.log('❌ Patient not found');
      return;
    }
    console.log('✅ Found patient:', patient.name, 'ID:', patient._id);

    // Check consent
    const consent = await Consent.findOne({
      doctorId: doctor._id,
      patientId: patient._id
    }).populate('doctorId patientId', 'name');
    
    console.log('\n📋 CONSENT RECORD:');
    if (consent) {
      console.log({
        ID: consent._id,
        Doctor: consent.doctorId?.name,
        Patient: consent.patientId?.name,
        Status: consent.status,
        RequestDate: consent.requestDate,
        ResponseDate: consent.responseDate
      });
    } else {
      console.log('❌ No consent found!');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkConsent();
