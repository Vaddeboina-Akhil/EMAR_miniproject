const mongoose = require('mongoose');
require('dotenv').config();

// Set longer timeout for development
mongoose.set('bufferCommands', false);

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/emar';
console.log('Connecting to:', dbUri);

mongoose.connect(dbUri, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
}).then(async () => {
  try {
    const AccessLog = require('./src/models/AccessLog');
    
    // Clear existing logs for this patient (optional)
    const patientId = 'EMAR-P-2932';
    
    // Create test audit logs
    const testLogs = [
      {
        patientId: patientId,
        doctorName: 'Dr. AVK. ABHIRAMA PRANEETH',
        hospitalName: 'Rainbow Hospital',
        accessType: 'requested',
        reason: 'Patient medical check',
        recordsAccessed: 'General Checkup',
        timestamp: new Date(Date.now() - 5*24*60*60*1000) // 5 days ago
      },
      {
        patientId: patientId,
        doctorName: 'Dr. AVK. ABHIRAMA PRANEETH',
        hospitalName: 'Rainbow Hospital',
        accessType: 'approved',
        reason: 'Access granted for patient medical check',
        recordsAccessed: 'General Checkup',
        timestamp: new Date(Date.now() - 4*24*60*60*1000) // 4 days ago
      },
      {
        patientId: patientId,
        doctorName: 'Staff',
        hospitalName: 'Apollo Hospitals Chennai',
        accessType: 'record_uploaded',
        reason: 'Blood Test uploaded - Routine Checkup',
        recordsAccessed: 'Blood Test',
        timestamp: new Date(Date.now() - 3*24*60*60*1000) // 3 days ago
      },
      {
        patientId: patientId,
        doctorName: 'Dr. JOHN SMITH',
        hospitalName: 'Apollo Hospitals Chennai',
        accessType: 'record_approved',
        reason: 'Blood Test approved by Dr. JOHN SMITH',
        recordsAccessed: 'Blood Test',
        timestamp: new Date(Date.now() - 2*24*60*60*1000) // 2 days ago
      }
    ];
    
    await AccessLog.insertMany(testLogs);
    console.log('✅ Created', testLogs.length, 'test audit logs for patient', patientId);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
