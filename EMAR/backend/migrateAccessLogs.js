#!/usr/bin/env node
/**
 * Migration Script: Sync AccessLog entries with approved/denied Consents
 * 
 * This script:
 * 1. Finds all approved and denied consents
 * 2. Checks if AccessLog entries exist for them
 * 3. Creates missing AccessLog entries
 * 4. Reports the results
 * 
 * Usage: node migrateAccessLogs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Consent = require('./src/models/Consent');
const AccessLog = require('./src/models/AccessLog');

const migrateAccessLogs = async () => {
  try {
    // Connect to MongoDB
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emar';
    console.log(`\n📊 Connecting to MongoDB: ${dbUri.substring(0, 50)}...`);
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all approved and denied consents
    console.log('🔍 Finding approved/denied consents...');
    const approvedConsents = await Consent.find({ 
      status: { $in: ['approved', 'denied'] } 
    });
    console.log(`Found ${approvedConsents.length} approved/denied consents\n`);

    let createdCount = 0;
    let skippedCount = 0;
    let errors = [];

    // Process each consent
    for (const consent of approvedConsents) {
      try {
        // Check if AccessLog entry already exists
        const existingLog = await AccessLog.findOne({
          patientId: consent.patientId,
          doctorName: consent.doctorName,
          accessType: consent.status,
          timestamp: { 
            $gte: consent.responseDate ? new Date(consent.responseDate.getTime() - 1000) : new Date(0) 
          }
        });

        if (!existingLog) {
          // Create missing AccessLog entry
          await AccessLog.create({
            patientId: consent.patientId,
            doctorName: consent.doctorName,
            hospitalName: consent.hospitalName,
            reason: consent.reason,
            accessType: consent.status, // 'approved' or 'denied'
            timestamp: consent.responseDate || new Date()
          });
          createdCount++;
          console.log(`  ✅ Created log for: ${consent.doctorName} - ${consent.status}`);
        } else {
          skippedCount++;
          console.log(`  ⏩ Skipped (already exists): ${consent.doctorName} - ${consent.status}`);
        }
      } catch (err) {
        errors.push({
          consent: `${consent.doctorName} (${consent._id})`,
          error: err.message
        });
        console.log(`  ❌ Error for ${consent.doctorName}: ${err.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total Consents Processed: ${approvedConsents.length}`);
    console.log(`  New AccessLogs Created:   ${createdCount}`);
    console.log(`  Existing (Skipped):       ${skippedCount}`);
    console.log(`  Errors:                   ${errors.length}`);
    console.log('='.repeat(60) + '\n');

    if (errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      errors.forEach(e => {
        console.log(`  - ${e.consent}: ${e.error}`);
      });
      console.log();
    }

    // Verify final count
    console.log('🔢 Verifying final AccessLog counts:');
    const totalLogs = await AccessLog.countDocuments();
    console.log(`  Total AccessLog entries in database: ${totalLogs}\n`);

    // Show counts per patient (if there are any logs)
    if (totalLogs > 0) {
      console.log('📊 AccessLogs per patient:');
      const logsByPatient = await AccessLog.aggregate([
        { $group: { _id: '$patientId', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      for (const item of logsByPatient) {
        console.log(`  - Patient ${item._id}: ${item.count} logs`);
      }
      console.log();
    }

    console.log('✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
};

// Run migration
migrateAccessLogs();
