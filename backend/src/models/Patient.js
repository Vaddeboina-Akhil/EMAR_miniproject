const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  age: { type: Number },
  aadhaarId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  bloodGroup: { type: String },
  allergies: { type: String },
  guardianContact: { type: String },
  patientId: { type: String, unique: true },
  profileImage: { type: String, default: null }, // base64 string
  role: { type: String, default: 'patient' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);