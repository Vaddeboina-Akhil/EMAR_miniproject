const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientEmail: { type: String },
  patientName: { type: String },
  recordType: { type: String, required: true },
  diagnosis: { type: String },
  description: { type: String },
  hospitalName: { type: String },
  doctorName: { type: String },
  staffName: { type: String },
  visitDate: { type: String },
  status: { type: String, default: 'pending' },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);