#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Consent = require('./src/models/Consent');
const Patient = require('./src/models/Patient');

const removeConsent = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    console.log('\n📊 Removing "Unknown Doctor" Consent...\n');
    await mongoose.connect(dbUri);

    // Find patient
    const patient = await Patient.findOne({ name: 'Vaddeboina Akhil' });
    if (!patient) {
      console.log('❌ Patient not found');
      return;
    }

    // Find the consent with Dr. Rajesh Kumar (which shows as "Unknown Doctor") for this patient
    const consentToDelete = await Consent.findOne({
      patientId: patient._id,
      doctorName: { $in: [null, undefined] } // First try null/undefined
    });

    if (consentToDelete) {
      console.log('Found consent to delete:');
      console.log(`  Doctor ID: ${consentToDelete.doctorId}`);
      console.log(`  Doctor Name: ${consentToDelete.doctorName}`);
      console.log(`  Status: ${consentToDelete.status}`);
      
      const result = await Consent.deleteOne({ _id: consentToDelete._id });
      console.log(`✅ Deleted consent with ID: ${consentToDelete._id}\n`);
    } else {
      // Try another approach - find all consents and show them
      const allConsents = await Consent.find({ patientId: patient._id }).populate('doctorId', 'name');
      console.log('All consents for this patient:');
      allConsents.forEach((c, i) => {
        console.log(`  ${i + 1}. ID: ${c._id}`);
        console.log(`     Doctor ID: ${c.doctorId?._id || 'null'}`);
        console.log(`     Doctor Name: ${c.doctorId?.name || c.doctorName || 'UNKNOWN'}`);
        console.log(`     Status: ${c.status}`);
      });

      // Delete the first one (which should be Dr. Rajesh Kumar with approved status from 3/25/2026)
      const targetConsent = allConsents.find(c => 
        c.requestDate && new Date(c.requestDate).toLocaleDateString() === '3/24/2026'
      );

      if (targetConsent) {
        await Consent.deleteOne({ _id: targetConsent._id });
        console.log(`\n✅ Deleted consent: ${targetConsent._id}\n`);
      }
    }

    // Show remaining consents
    const remaining = await Consent.find({ patientId: patient._id });
    console.log(`Remaining consents for patient: ${remaining.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

removeConsent();
