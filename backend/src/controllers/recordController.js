const MedicalRecord = require('../models/MedicalRecord');

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
    const records = await MedicalRecord.find({ patientId: req.params.patientId });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadRecord, getPatientRecords, approveRecord };