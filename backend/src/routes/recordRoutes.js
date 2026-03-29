const express = require('express');
const router = express.Router();
const { authMiddleware, allowStaff, allowDoctor, allowPatient } = require('../middleware/authMiddleware');
const {
  createDraftRecord,
  submitRecord,
  getStaffRecords,
  uploadRecord,
  getPatientRecords,
  getPendingRecords,
  approveRecord,
  getRecordsByDoctor
} = require('../controllers/recordController');

// 📋 STAFF APIs (protected)
router.post('/staff/create-draft', authMiddleware, allowStaff, createDraftRecord);
router.put('/staff/submit/:id', authMiddleware, allowStaff, submitRecord);
router.get('/staff/:staffId', authMiddleware, allowStaff, getStaffRecords);

// 👨‍⚕️ DOCTOR APIs (protected)
router.get('/pending/:doctorId', authMiddleware, allowDoctor, getPendingRecords);
router.put('/approve/:id', authMiddleware, allowDoctor, approveRecord);
router.get('/doctor/:doctorId', authMiddleware, allowDoctor, getRecordsByDoctor);

// 👤 PATIENT APIs (protected)
router.get('/:patientId', authMiddleware, allowPatient, getPatientRecords);

// Legacy endpoint
router.post('/upload', uploadRecord);

module.exports = router;