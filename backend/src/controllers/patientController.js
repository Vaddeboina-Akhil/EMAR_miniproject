const Patient = require('../models/Patient');

exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Try to count medical records — won't crash if collection is empty
    let recordsCount = 0;
    try {
      const MedicalRecord = require('../models/MedicalRecord');
      recordsCount = await MedicalRecord.countDocuments({ patientId });
    } catch (e) {
      recordsCount = 0;
    }

    // Try to count access logs — won't crash if collection is empty
    let accessLogsCount = 0;
    try {
      const AccessLog = require('../models/AccessLog');
      accessLogsCount = await AccessLog.countDocuments({ patientId });
    } catch (e) {
      accessLogsCount = 0;
    }

    res.json({
      patient,
      stats: { recordsCount, accessLogsCount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    const patient = await Patient.findByIdAndUpdate(
      req.params.patientId, updates, { new: true }
    ).select('-password');
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};