#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const AccessLog = require('./src/models/AccessLog');

const removeUnknownDoctor = async () => {
  try {
    const dbUri = process.env.MONGO_URI;
    console.log('\n📊 Removing Unknown Doctor entry...\n');
    await mongoose.connect(dbUri);

    // Find and delete the entry with undefined/null doctorName
    const result = await AccessLog.deleteOne({ doctorName: undefined });
    
    if (result.deletedCount > 0) {
      console.log('✅ Deleted 1 entry with undefined doctorName');
    } else {
      // Try another approach
      const result2 = await AccessLog.deleteOne({ doctorName: null });
      if (result2.deletedCount > 0) {
        console.log('✅ Deleted 1 entry with null doctorName');
      } else {
        // Show all entries and ask which one to delete
        const allLogs = await AccessLog.find();
        const unknownDoctorLog = allLogs.find(log => !log.doctorName || log.doctorName === 'undefined');
        if (unknownDoctorLog) {
          console.log('Found Unknown Doctor entry:');
          console.log(unknownDoctorLog);
          const deleteResult = await AccessLog.deleteOne({ _id: unknownDoctorLog._id });
          console.log(`✅ Deleted entry with ID: ${unknownDoctorLog._id}`);
        }
      }
    }

    // Show remaining count
    const remaining = await AccessLog.countDocuments();
    console.log(`Remaining AccessLog entries: ${remaining}\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

removeUnknownDoctor();
