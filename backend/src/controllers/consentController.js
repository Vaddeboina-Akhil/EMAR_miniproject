const Consent = require('../models/Consent');
const AccessLog = require('../models/AccessLog');

const requestAccess = async (req, res) => {
  try {
    const consent = await Consent.create(req.body);
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
    if (status === 'approved') {
      await AccessLog.create({
        patientId: consent.patientId,
        doctorName: consent.doctorName,
        hospitalName: consent.hospitalName,
        reason: consent.reason,
        accessType: 'approved',
        timestamp: new Date()
      });
    }
    res.json(consent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAccessLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find({ patientId: req.params.patientId });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { requestAccess, getPatientConsents, respondConsent, getAccessLogs };