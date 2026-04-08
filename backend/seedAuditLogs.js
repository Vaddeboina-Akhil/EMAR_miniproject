const mongoose = require('mongoose');
require('./src/config/db');

const AuditLog = require('./src/models/AuditLog');
const Patient = require('./src/models/Patient');

(async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Get the first patient from database
    const patient = await Patient.findOne().lean();
    
    if (!patient) {
      console.log('❌ No patient found in database');
      process.exit(1);
    }
    
    const patientId = patient._id;
    console.log(`✅ Found patient: ${patient.name || patient.patientId}`);
    
    // Create sample audit logs
    const testLogs = [
      {
        patientId,
        actor_entity: 'Dr. ABHIRAMA PRANEETH',
        action_type: 'requested',
        affected_resource: 'medical_records',
        metadata: {
          reason: 'Patient medical checkup',
          ipAddress: '192.168.1.100',
          recordType: 'general'
        },
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        patientId,
        actor_entity: 'Patient',
        action_type: 'approved',
        affected_resource: 'medical_records',
        metadata: {
          reason: 'Patient approved access to medical records',
          ipAddress: '192.168.1.50'
        },
        timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
      },
      {
        patientId,
        actor_entity: 'Patient Record System',
        action_type: 'record_uploaded',
        affected_resource: 'medical_record_blood_test',
        metadata: {
          reason: 'Blood Test uploaded - Routine Checkup',
          recordType: 'blood_test'
        },
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        patientId,
        actor_entity: 'Dr. JOHN SMITH',
        action_type: 'record_approved',
        affected_resource: 'medical_record_blood_test',
        metadata: {
          reason: 'Blood Test approved',
          recordType: 'blood_test'
        },
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        patientId,
        actor_entity: 'Dr. RAMESH KUMAR',
        action_type: 'requested',
        affected_resource: 'medical_records',
        metadata: {
          reason: 'Follow-up consultation',
          ipAddress: '192.168.1.120'
        },
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        patientId,
        actor_entity: 'Patient',
        action_type: 'denied',
        affected_resource: 'medical_records',
        metadata: {
          reason: 'Patient rejected access request'
        },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        patientId,
        actor_entity: 'Patient Record System',
        action_type: 'record_uploaded',
        affected_resource: 'medical_record_xray',
        metadata: {
          reason: 'X-ray uploaded - Chest imaging',
          recordType: 'xray'
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        patientId,
        actor_entity: 'Emergency System',
        action_type: 'emergency',
        affected_resource: 'medical_records',
        metadata: {
          reason: 'Emergency access granted by hospital',
          ipAddress: '192.168.100.50'
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        patientId,
        actor_entity: 'Dr. PRIYA SHARMA',
        action_type: 'view',
        affected_resource: 'medical_record_prescription',
        metadata: {
          reason: 'Viewed patient prescription',
          ipAddress: '192.168.1.200'
        },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      }
    ];
    
    // Insert logs
    await AuditLog.insertMany(testLogs);
    console.log(`✅ Successfully created ${testLogs.length} audit logs`);
    console.log('📊 Logs include: requests, approvals, denials, uploads, emergency access, and views');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
