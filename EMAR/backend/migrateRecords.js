const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const MedicalRecord = require('./src/models/MedicalRecord');

async function migrateRecords() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully\n');

    // Find all records with status 'pending' or 'draft' that don't have uploaderRole
    console.log('Searching for records to migrate...');
    const recordsToMigrate = await MedicalRecord.find({
      $or: [
        { status: 'pending', uploaderRole: { $exists: false } },
        { status: 'draft', uploaderRole: { $exists: false } },
        { status: 'pending', uploaderRole: null },
        { status: 'draft', uploaderRole: null }
      ]
    });

    console.log(`Found ${recordsToMigrate.length} records to migrate\n`);

    if (recordsToMigrate.length === 0) {
      console.log('✅ No records need migration. All records are up-to-date!');
      await mongoose.connection.close();
      return;
    }

    // Update records
    console.log('Updating records with uploaderRole: "staff"...\n');
    let updated = 0;
    let errors = 0;

    for (const record of recordsToMigrate) {
      try {
        // Set uploaderRole to 'staff' for all old records
        record.uploaderRole = 'staff';
        
        // Convert draft to pending (new system doesn't use draft)
        if (record.status === 'draft') {
          record.status = 'pending';
        }

        await record.save();
        updated++;

        console.log(`✅ Updated record ${updated}/${recordsToMigrate.length}`);
        console.log(`   Record ID: ${record._id}`);
        console.log(`   Patient: ${record.patientId}`);
        console.log(`   Status: ${record.status}`);
        console.log(`   Uploader Role: ${record.uploaderRole}\n`);
      } catch (err) {
        errors++;
        console.error(`❌ Error updating record ${record._id}: ${err.message}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total records processed: ${recordsToMigrate.length}`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed updates: ${errors}`);
    console.log('='.repeat(60) + '\n');

    if (updated > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('All old pending records now have uploaderRole set to "staff"');
      console.log('Draft records have been converted to "pending" status');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateRecords();
