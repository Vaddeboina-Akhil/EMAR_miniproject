const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');

// 📋 STAFF: Create record in DRAFT status
const createDraftRecord = async (req, res) => {
  try {
    const {
      patientId, patientName, patientEmail, recordType, diagnosis,
      medicines, notes, hospitalName, staffId, staffName
    } = req.body;

    const record = await MedicalRecord.create({
      patientId,
      patientName,
      patientEmail,
      recordType,
      diagnosis,
      medicines,
      notes,
      hospitalName,
      staffId,
      staffName,
      status: 'draft',
      uploadedBy: staffId,
      uploaderRole: 'staff'
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 STAFF: Submit record (draft → pending)
const submitRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id);

    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft records can be submitted' });
    }

    const updated = await MedicalRecord.findByIdAndUpdate(
      id,
      { status: 'pending', updatedAt: new Date() },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 STAFF: View all records created by this staff
const getStaffRecords = async (req, res) => {
  try {
    const { staffId } = req.params;
    const records = await MedicalRecord.find({ staffId })
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👤 PATIENT: Only see APPROVED records
const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patientId: req.params.patientId,
      status: 'approved'  // Only approved records
    }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👨‍⚕️ DOCTOR: Get pending records for approval
const getPendingRecords = async (req, res) => {
  try {
    const { doctorId } = req.params;
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

// 👨‍⚕️ DOCTOR: Approve or reject record
const approveRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const { doctorId, doctorName } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = {
      status,
      approvedBy: doctorId,
      approvalDate: new Date(),
      updatedAt: new Date()
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || 'No reason provided';
    }

    const record = await MedicalRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👨‍⚕️ DOCTOR: Get all records added by this doctor
const getRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const records = await MedicalRecord.find({ doctorId })
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDraftRecord,
  submitRecord,
  getStaffRecords,
  uploadRecord,
  getPatientRecords,
  getPendingRecords,
  approveRecord,
  getRecordsByDoctor
};