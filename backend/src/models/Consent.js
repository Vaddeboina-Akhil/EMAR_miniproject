const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientEmail: { type: String },
  doctorId: { type: String },
  doctorName: { type: String },
  hospitalName: { type: String },
  reason: { type: String },
  status: { type: String, default: 'pending' },
  requestDate: { type: Date, default: Date.now },
  responseDate: { type: Date }
});

module.exports = mongoose.model('Consent', consentSchema);