#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const AccessLog = require('./src/models/AccessLog');
const Patient = require('./src/models/Patient');

const checkAccessLogs = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    console.log('\n📊 Checking AccessLog Database...\n');
    await mongoose.connect(dbUri);

    // Find Vaddeboina Akhil patient
    const patient = await Patient.findOne({ name: 'Vaddeboina Akhil' });
    
    if (!patient) {
      console.log('❌ Patient not found');
      return;
    }

    console.log(`✅ Found Patient: ${patient.name} (ID: ${patient._id})\n`);

    // Get all access logs for this patient
    const logs = await AccessLog.find({ patientId: patient._id }).sort({ timestamp: -1 });
    
    console.log(`📋 AccessLog entries for this patient: ${logs.length}\n`);
    console.log('='.repeat(80));
    
    logs.forEach((log, i) => {
      console.log(`\n${i + 1}. Doctor: ${log.doctorName}`);
      console.log(`   Hospital: ${log.hospitalName}`);
      console.log(`   AccessType: ${log.accessType}`);
      console.log(`   Reason: ${log.reason}`);
      console.log(`   Timestamp: ${log.timestamp}`);
      console.log(`   Records Accessed: ${log.recordsAccessed || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:');
    
    const byType = {};
    logs.forEach(log => {
      byType[log.accessType] = (byType[log.accessType] || 0) + 1;
    });
    
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkAccessLogs();
