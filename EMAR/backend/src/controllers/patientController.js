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

    let recordsCount = 0;
    try {
      const MedicalRecord = require('../models/MedicalRecord');
      recordsCount = await MedicalRecord.countDocuments({ patientId, status: { $ne: 'rejected' } });
    } catch (e) { recordsCount = 0; }

    let accessLogsCount = 0;
    try {
      const AccessLog = require('../models/AccessLog');
      accessLogsCount = await AccessLog.countDocuments({ patientId });
    } catch (e) { accessLogsCount = 0; }

    // Count access requests (consents sent to this patient)
    let accessRequestsCount = 0;
    try {
      const Consent = require('../models/Consent');
      accessRequestsCount = await Consent.countDocuments({ patientId });
    } catch (e) { accessRequestsCount = 0; }

    // Total = audit trail logs + access requests
    const totalAccessCount = accessLogsCount + accessRequestsCount;

    res.json({ patient, stats: { recordsCount, accessLogsCount: totalAccessCount, auditTrailCount: accessLogsCount, requestsCount: accessRequestsCount } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search patients by name, EMAR ID, or Aadhaar
exports.searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query too short' });
    }
    const query = q.trim();
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { patientId: { $regex: query, $options: 'i' } },
        { aadhaarId: { $regex: query, $options: 'i' } },
      ]
    }).select('-password').limit(10);
    res.json(patients);
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