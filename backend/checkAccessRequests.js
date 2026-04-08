#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Consent = require('./src/models/Consent');
const Patient = require('./src/models/Patient');
const Doctor = require('./src/models/Doctor');

const checkData = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    console.log('\n📊 Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✅ Connected\n');

    // Get all consents with details
    const allConsents = await Consent.find().populate('patientId', 'name patientId').populate('doctorId', 'name');
    
    console.log('📋 ALL CONSENTS IN DATABASE:');
    console.log('='.repeat(80));
    
    allConsents.forEach((c, i) => {
      console.log(`\n${i + 1}. Consent ID: ${c._id}`);
      console.log(`   Patient: ${c.patientId?.name || c.patientId?._id || 'Unknown'} (ID: ${c.patientId?._id || c.patientId})`);
      console.log(`   Doctor: ${c.doctorId?.name || c.doctorName || 'Unknown'}`);
      console.log(`   Hospital: ${c.hospitalName}`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Reason: ${c.reason}`);
      console.log(`   Request Date: ${c.requestDate}`);
      console.log(`   Response Date: ${c.responseDate || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`   Total Consents: ${allConsents.length}`);
    
    const byStatus = {};
    allConsents.forEach(c => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });
    
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Check for specific patient (Vaddeboina Akhil - EMAR-P-2932)
    console.log('\n' + '='.repeat(80));
    console.log('🔍 CHECKING PATIENT VADDEBOINA AKHIL:');
    
    const patient = await Patient.findOne({ 
      $or: [{ patientId: 'EMAR-P-2932' }, { name: { $regex: 'Vaddeboina', $options: 'i' } }] 
    });
    
    if (patient) {
      console.log(`Found patient: ${patient.name} (ID: ${patient._id})`);
      const consentsForPatient = await Consent.find({ patientId: patient._id }).populate('doctorId', 'name');
      console.log(`✅ Consents for this patient: ${consentsForPatient.length}`);
      consentsForPatient.forEach(c => {
        console.log(`  - ${c.doctorName || c.doctorId?.name} (${c.status})`);
      });
    } else {
      console.log('❌ Patient not found');
    }

    console.log('\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkData();
