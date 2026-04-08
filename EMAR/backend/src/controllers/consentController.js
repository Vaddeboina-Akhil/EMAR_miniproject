const Consent = require('../models/Consent');
const AccessLog = require('../models/AccessLog');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const requestAccess = async (req, res) => {
  try {
    const consent = await Consent.create(req.body);
    // 📝 Log the access request
    await AccessLog.create({
      patientId: consent.patientId,
      doctorName: consent.doctorName,
      hospitalName: consent.hospitalName,
      reason: consent.reason,
      accessType: 'requested',
      timestamp: new Date()
    });
    // 📝 Save audit log for patient
    if (consent.doctorId) {
      await AuditLog.create({
        patientId: consent.patientId,
        actor_entity: consent.doctorName || 'Unknown Doctor',
        action_type: 'requested',
        affected_resource: 'medical_records',
        metadata: {
          reason: consent.reason,
          recordType: 'medical'
        }
      });
    }
    res.status(201).json(consent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientConsents = async (req, res) => {
  try {
    const consents = await Consent.find({ patientId: req.params.patientId });
    res.json(consents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const respondConsent = async (req, res) => {
  try {
    const { status } = req.body;
    const consent = await Consent.findByIdAndUpdate(
      req.params.id,
      { status, responseDate: new Date() },
      { new: true }
    );
    // 📝 Log the response (approved or denied)
    if (status === 'approved' || status === 'denied') {
      await AccessLog.create({
        patientId: consent.patientId,
        doctorName: consent.doctorName,
        hospitalName: consent.hospitalName,
        reason: consent.reason,
        accessType: status,
        timestamp: new Date()
      });
      // 📝 Save audit log for patient
      if (consent.doctorId) {
        await AuditLog.create({
          patientId: consent.patientId,
          actor_entity: 'Patient',
          action_type: status === 'approved' ? 'approved' : 'denied',
          affected_resource: 'medical_records',
          metadata: {
            reason: status === 'approved' 
              ? 'Patient approved access to medical records'
              : 'Patient rejected access request',
            recordType: 'medical'
          }
        });
      }
    }
    res.json(consent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAccessLogs = async (req, res) => {
  try {
    const patientIdParam = req.params.patientId;
    
    // Try multiple approaches to find logs
    let logs = [];
    
    // First, try direct lookup by ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(patientIdParam)) {
      logs = await AccessLog.find({ patientId: mongoose.Types.ObjectId(patientIdParam) })
        .sort({ timestamp: -1 });
    }
    
    // If no logs found, try looking up patient and use their ObjectId
    if (logs.length === 0) {
      const Patient = require('../models/Patient');
      const patient = await Patient.findOne({ 
        $or: [{ _id: patientIdParam }, { patientId: patientIdParam }] 
      });
      if (patient) {
        logs = await AccessLog.find({ patientId: patient._id })
          .sort({ timestamp: -1 });
      }
    }
    
    res.json(logs);
  } catch (err) {
    console.error('Error fetching access logs:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ NEW — Get all access requests sent by this doctor
const getConsentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const consents = await Consent.find({ doctorId })
      .populate('patientId', 'name patientId email')
      .populate('doctorId', 'name hospitalName')
      .sort({ requestDate: -1 });
    res.json(consents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ TEMP — Seed test audit logs for demo/testing
const seedTestLogs = async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ message: 'patientId required in request body' });
    }

    const testLogs = [
      {
        patientId,
        doctorName: 'Dr. AVK. ABHIRAMA PRANEETH',
        hospitalName: 'Rainbow Hospital',
        accessType: 'requested',
        reason: 'Patient medical check',
        recordsAccessed: 'General Checkup',
        timestamp: new Date(Date.now() - 5*24*60*60*1000)
      },
      {
        patientId,
        doctorName: 'Dr. AVK. ABHIRAMA PRANEETH',
        hospitalName: 'Rainbow Hospital',
        accessType: 'approved',
        reason: 'Access granted for patient medical check',
        recordsAccessed: 'General Checkup',
        timestamp: new Date(Date.now() - 4*24*60*60*1000)
      },
      {
        patientId,
        doctorName: 'Staff',
        hospitalName: 'Apollo Hospitals Chennai',
        accessType: 'record_uploaded',
        reason: 'Blood Test uploaded - Routine Checkup',
        recordsAccessed: 'Blood Test',
        timestamp: new Date(Date.now() - 3*24*60*60*1000)
      },
      {
        patientId,
        doctorName: 'Dr. JOHN SMITH',
        hospitalName: 'Apollo Hospitals Chennai',
        accessType: 'record_approved',
        reason: 'Blood Test approved by Dr. JOHN SMITH',
        recordsAccessed: 'Blood Test',
        timestamp: new Date(Date.now() - 2*24*60*60*1000)
      }
    ];

    await AccessLog.insertMany(testLogs);
    res.json({ 
      message: `✅ Created ${testLogs.length} test audit logs for patient ${patientId}`,
      logs: testLogs 
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ VERIFICATION — Get detailed access log statistics
const getAccessLogStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Count total logs for the patient
    const totalLogs = await AccessLog.countDocuments({ patientId });
    
    // Count logs by access type
    const logsByType = await AccessLog.aggregate([
      { $match: { patientId: mongoose.Types.ObjectId.isValid(patientId) ? mongoose.Types.ObjectId(patientId) : patientId } },
      { $group: { _id: '$accessType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Get all logs
    const logs = await AccessLog.find({ patientId })
      .sort({ timestamp: -1 });
    
    res.json({
      patientId,
      totalLogs,
      logsByType: logsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      logs
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ MIGRATION — Create missing AccessLog entries for already-approved consents
const migrateAccessLogs = async (req, res) => {
  try {
    // Find all approved consents
    const approvedConsents = await Consent.find({ status: { $in: ['approved', 'denied'] } });
    
    let createdCount = 0;
    let skippedCount = 0;

    for (const consent of approvedConsents) {
      // Check if AccessLog entry already exists
      const existingLog = await AccessLog.findOne({
        patientId: consent.patientId,
        doctorName: consent.doctorName,
        accessType: consent.status,
        timestamp: { $gte: consent.responseDate ? new Date(consent.responseDate.getTime() - 1000) : new Date(0) }
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
      } else {
        skippedCount++;
      }
    }

    res.json({
      message: `✅ Migration completed: Created ${createdCount} new logs, Skipped ${skippedCount} existing logs`,
      totalConsents: approvedConsents.length,
      createdLogs: createdCount,
      skippedLogs: skippedCount
    });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ NEW — Get audit logs for a patient (both old AccessLogs and new AuditLogs)
const getAuditLogs = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Try to find patient by custom patientId or MongoDB _id
    const Patient = require('../models/Patient');
    let patientObjectId = null;
    
    // First try to find by custom patientId field
    const patientByCustomId = await Patient.findOne({ patientId }).lean();
    if (patientByCustomId) {
      patientObjectId = patientByCustomId._id;
    } else {
      // Try as MongoDB ObjectId directly
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patientObjectId = new mongoose.Types.ObjectId(patientId);
      }
    }
    
    if (!patientObjectId) {
      return res.json([]); // Return empty if patient not found
    }

    // Fetch new audit logs
    const auditLogs = await AuditLog.find({ patientId: patientObjectId }).lean();

    // Fetch old access logs and transform them to match new format
    const accessLogs = await AccessLog.find({ patientId: patientObjectId }).lean();
    const transformedAccessLogs = accessLogs.map(log => ({
      _id: log._id,
      patientId: log.patientId,
      actor_entity: log.doctorName || log.actor || 'Unknown',
      action_type: log.accessType || log.action_type || 'view',
      affected_resource: log.recordsAccessed || 'medical_records',
      metadata: {
        reason: log.reason || '',
        ipAddress: log.ipAddress || ''
      },
      timestamp: log.timestamp || log.createdAt || new Date()
    }));

    // Combine both logs and sort by timestamp (newest first)
    const allLogs = [...auditLogs, ...transformedAccessLogs].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
      const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
      return timeB - timeA;
    });

    res.json(allLogs);
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { requestAccess, getPatientConsents, respondConsent, getAccessLogs, getConsentsByDoctor, seedTestLogs, migrateAccessLogs, getAccessLogStats, getAuditLogs };