const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorName: { type: String },
  hospitalName: { type: String },
  accessType: { type: String },
  reason: { type: String },
  ipAddress: { type: String },
  recordsAccessed: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccessLog', accessLogSchema);