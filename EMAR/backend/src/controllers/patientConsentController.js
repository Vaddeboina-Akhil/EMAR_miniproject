const Patient = require('../models/Patient');
const Consent = require('../models/Consent');
const AccessLog = require('../models/AccessLog');

/**
 * Get patient's default consent settings
 */
exports.getConsentSettings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId }).select('consentSettings patientId name email');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      patientId: patient.patientId,
      name: patient.name,
      email: patient.email,
      consentSettings: patient.consentSettings || {
        basicInfo: true,
        prescriptions: true,
        fullReports: true,
        emergencyAccess: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update patient's default consent settings
 */
exports.updateConsentSettings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { consentSettings } = req.body;

    if (!consentSettings || typeof consentSettings !== 'object') {
      return res.status(400).json({ message: 'Invalid consent settings' });
    }

    const patient = await Patient.findOneAndUpdate(
      { patientId },
      {
        consentSettings: {
          basicInfo: consentSettings.basicInfo !== undefined ? consentSettings.basicInfo : true,
          prescriptions: consentSettings.prescriptions !== undefined ? consentSettings.prescriptions : true,
          fullReports: consentSettings.fullReports !== undefined ? consentSettings.fullReports : true,
          emergencyAccess: consentSettings.emergencyAccess !== undefined ? consentSettings.emergencyAccess : false
        }
      },
      { new: true }
    ).select('consentSettings patientId name email');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Consent settings updated successfully',
      consentSettings: patient.consentSettings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all active consents for a patient
 */
exports.getActiveConsents = async (req, res) => {
  try {
    const { patientId } = req.params;

    const consents = await Consent.find({
      patientId: { $in: [patientId, require('mongoose').Types.ObjectId(patientId)] },
      status: 'approved',
      revokedAt: null,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate('doctorId', 'name specialization hospitalName')
      .sort({ responseDate: -1 });

    res.json(consents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get access history for a patient
 */
exports.getAccessHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const logs = await AccessLog.find({ patientId: patient._id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get pending consent requests for a patient
 */
exports.getPendingConsents = async (req, res) => {
  try {
    const { patientId } = req.params;

    const consents = await Consent.find({
      patientId: { $in: [patientId, require('mongoose').Types.ObjectId(patientId)] },
      status: 'pending'
    })
      .populate('doctorId', 'name specialization hospitalName email')
      .sort({ requestDate: -1 });

    res.json(consents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * View all consents (active, pending, revoked)
 */
exports.getAllConsents = async (req, res) => {
  try {
    const { patientId } = req.params;

    const consents = await Consent.find({
      patientId: { $in: [patientId, require('mongoose').Types.ObjectId(patientId)] }
    })
      .populate('doctorId', 'name specialization hospitalName email')
      .sort({ requestDate: -1 });

    // Group by status
    const grouped = {
      approved: [],
      pending: [],
      rejected: [],
      revoked: []
    };

    consents.forEach(consent => {
      if (grouped[consent.status]) {
        grouped[consent.status].push(consent);
      }
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
