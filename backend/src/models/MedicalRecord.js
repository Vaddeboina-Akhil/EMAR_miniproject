const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientEmail: { type: String },
  patientName: { type: String },
  recordType: { type: String, required: true },
  diagnosis: { type: String },
  medicines: { type: String },
  notes: { type: String },
  description: { type: String },
  hospitalName: { type: String },
  doctorName: { type: String },
  doctorId: { type: String },
  doctorObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // Reference to Doctor model
  staffName: { type: String },
  staffId: { type: String },
  visitDate: { type: String },
  
  // Status workflow: draft → pending → approved/rejected
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
  
  // Track who uploaded and their role
  uploadedBy: { type: String },
  uploaderRole: { type: String, enum: ['staff', 'doctor'], default: 'staff' },
  
  // Doctor approval tracking
  approvedBy: { type: String },
  approvalDate: { type: Date },
  rejectionReason: { type: String },
  
  // PDF File storage (base64 encoded)
  fileUrl: { type: String }, // base64 encoded PDF
  fileName: { type: String },
  fileSize: { type: Number },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);