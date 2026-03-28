const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');

const uploadRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patientId: req.params.patientId,
      status: { $ne: 'rejected' }
    }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get pending records for doctor's hospital
const getPendingRecords = async (req, res) => {
  try {
    const { doctorId } = req.params;
    // Find doctor to get hospitalName
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const records = await MedicalRecord.find({
      status: 'pending',
      hospitalName: doctor.hospitalName
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveRecord = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { status: status || 'approved' },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadRecord, getPatientRecords, getPendingRecords, approveRecord };