const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // Track which doctor accessed
  doctorName: { type: String },
  hospitalName: { type: String },
  accessType: { type: String }, // ACCESS_APPROVED, ACCESS_REQUESTED, RECORD_APPROVED, RECORD_UPLOADED
  reason: { type: String },
  ipAddress: { type: String },
  recordsAccessed: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccessLog', accessLogSchema);