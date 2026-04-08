#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Consent = require('./src/models/Consent');
const Doctor = require('./src/models/Doctor');

const checkDoctor = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    console.log('\n📊 Checking Doctor Data...\n');
    await mongoose.connect(dbUri);

    // Find doctor "Vaddeboina Akhil"
    const doctor = await Doctor.findOne({ $or: [{ name: 'Vaddeboina Akhil' }, { name: { $regex: 'Vaddeboina', $options: 'i' } }] });
    
    if (doctor) {
      console.log(`Found Doctor: ${doctor.name} (ID: ${doctor._id})`);
      console.log(`License ID: ${doctor.licenseId}`);
      console.log(`Hospital: ${doctor.hospitalName}\n`);

      // Find all consents sent by this doctor
      const consentsSent = await Consent.find({ doctorId: doctor._id }).populate('patientId', 'name patientId');
      
      console.log(`📋 Consents sent by Dr. ${doctor.name}:`);
      console.log('='.repeat(80));
      console.log(`Total: ${consentsSent.length}`);
      
      consentsSent.forEach((c, i) => {
        console.log(`\n${i + 1}. Patient: ${c.patientId?.name || 'Unknown'}`);
        console.log(`   Status: ${c.status}`);
        console.log(`   Reason: ${c.reason}`);
      });
    } else {
      console.log('❌ Doctor "Vaddeboina Akhil" not found in database');
      
      // List all doctors
      console.log('\n👨‍⚕️ ALL DOCTORS IN DATABASE:');
      const allDoctors = await Doctor.find();
      allDoctors.forEach(d => {
        console.log(`  - ${d.name} (ID: ${d._id})`);
      });
    }

    console.log('\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkDoctor();
