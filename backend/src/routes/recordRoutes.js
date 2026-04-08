const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authMiddleware, allowStaff, allowDoctor, allowPatient } = require('../middleware/authMiddleware');
const {
  createDraftRecord,
  submitRecord,
  getStaffRecords,
  uploadRecord,
  createPrescription,
  getPatientRecords,
  getPendingRecords,
  approveRecord,
  getRecordsByDoctor,
  downloadRecord
} = require('../controllers/recordController');

// Multer configuration for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 📋 STAFF APIs (protected)
router.post('/staff/create-draft', authMiddleware, allowStaff, createDraftRecord);
router.put('/staff/submit/:id', authMiddleware, allowStaff, submitRecord);
router.get('/staff/:staffId', authMiddleware, allowStaff, getStaffRecords);

// 👨‍⚕️ DOCTOR APIs (protected)
router.get('/pending/:doctorId', authMiddleware, allowDoctor, getPendingRecords);
router.put('/approve/:id', authMiddleware, allowDoctor, approveRecord);
router.get('/doctor/:doctorId', authMiddleware, allowDoctor, getRecordsByDoctor);

// 👤 PATIENT APIs (protected) - More specific routes BEFORE generic routes
router.get('/download/:recordId', downloadRecord); // Temporarily without auth to test
router.get('/:patientId', authMiddleware, getPatientRecords); // Allow both patient and doctor with consent

// Upload endpoints
router.post('/upload', upload.single('pdfFile'), uploadRecord); // Staff uploads (requires approval)
router.post('/prescription', authMiddleware, allowDoctor, createPrescription); // Doctor prescriptions (auto-approved)

module.exports = router;