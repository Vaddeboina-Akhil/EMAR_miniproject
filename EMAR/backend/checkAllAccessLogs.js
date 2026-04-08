#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const AccessLog = require('./src/models/AccessLog');

const checkAllLogs = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    console.log('\n📊 Checking ALL AccessLogs in Database...\n');
    await mongoose.connect(dbUri);

    const allLogs = await AccessLog.find().sort({ timestamp: -1 });
    
    console.log(`📋 Total AccessLog entries: ${allLogs.length}\n`);
    console.log('='.repeat(80));
    
    allLogs.forEach((log, i) => {
      console.log(`\n${i + 1}. Doctor: ${log.doctorName}`);
      console.log(`   Hospital: ${log.hospitalName}`);
      console.log(`   Patient ID: ${log.patientId}`);
      console.log(`   AccessType: ${log.accessType}`);
      console.log(`   Reason: ${log.reason}`);
      console.log(`   Timestamp: ${log.timestamp}`);
    });

    console.log('\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkAllLogs();
