#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const Consent = require('./src/models/Consent');
const Doctor = require('./src/models/Doctor');
const Patient = require('./src/models/Patient');

const checkByDoctor = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    console.log('\n📊 Checking Consents by Doctor...\n');
    await mongoose.connect(dbUri);

    const allConsents = await Consent.find().populate('doctorId', 'name').populate('patientId', 'name patientId');
    
    console.log('📋 ALL CONSENTS - DETAILED VIEW:');
    console.log('='.repeat(80));
    
    allConsents.forEach((c, i) => {
      console.log(`\n${i + 1}. Consent ID: ${c._id}`);
      console.log(`   Doctor ID (from doctorId field): ${c.doctorId ? c.doctorId._id : 'NULL'}`);
      console.log(`   Doctor Name (from doctorId field): ${c.doctorId ? c.doctorId.name : 'NULL'}`);
      console.log(`   Doctor Name (from doctorName field): ${c.doctorName}`);
      console.log(`   Patient: ${c.patientId?.name} (ID: ${c.patientId?._id})`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Reason: ${c.reason}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 CONSENTS GROUPED BY doctorId:');
    const byDoctorId = {};
    allConsents.forEach(c => {
      const did = c.doctorId ? c.doctorId._id.toString() : 'NO_DOCTOR_ID';
      byDoctorId[did] = (byDoctorId[did] || 0) + 1;
    });
    
    Object.entries(byDoctorId).forEach(([dId, count]) => {
      console.log(`  - Doctor ID ${dId}: ${count} consent(s)`);
    });

    console.log('\n📊 CONSENTS GROUPED BY doctorName:');
    const byDoctorName = {};
    allConsents.forEach(c => {
      const dn = c.doctorName || 'NO_DOCTOR_NAME';
      byDoctorName[dn] = (byDoctorName[dn] || 0) + 1;
    });
    
    Object.entries(byDoctorName).forEach(([dName, count]) => {
      console.log(`  - ${dName}: ${count} consent(s)`);
    });

    console.log('\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkByDoctor();
