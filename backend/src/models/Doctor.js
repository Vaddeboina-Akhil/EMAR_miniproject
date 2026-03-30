const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  age: { type: Number },
  licenseId: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  hospitalName: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  // Optional base64 image sent by the signup UI.
  profileImage: { type: String, default: null },
  password: { type: String, required: true },
  doctorId: { type: String, unique: true },
  role: { type: String, default: 'doctor' },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);