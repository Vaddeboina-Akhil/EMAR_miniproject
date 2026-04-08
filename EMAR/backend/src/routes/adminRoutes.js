const express = require('express');
const router = express.Router();
const { authMiddleware, allowAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// ============= DASHBOARD =============
router.get('/dashboard/stats', authMiddleware, allowAdmin, adminController.getDashboardStats);

// ============= DOCTOR MANAGEMENT =============
router.get('/doctors', authMiddleware, allowAdmin, adminController.listDoctors);
router.put('/doctors/:id/approve', authMiddleware, allowAdmin, adminController.approveDoctor);
router.put('/doctors/:id/reject', authMiddleware, allowAdmin, adminController.rejectDoctor);
router.put('/doctors/:id/block', authMiddleware, allowAdmin, adminController.blockDoctor);

// ============= STAFF MANAGEMENT =============
router.post('/staff', authMiddleware, allowAdmin, adminController.createStaff);
router.get('/staff', authMiddleware, allowAdmin, adminController.listStaff);
router.put('/staff/:id/block', authMiddleware, allowAdmin, adminController.blockStaff);

// ============= PATIENT MANAGEMENT =============
router.get('/patients', authMiddleware, allowAdmin, adminController.listPatients);
router.put('/patients/:id/block', authMiddleware, allowAdmin, adminController.blockPatient);

// ============= MEDICAL RECORDS MANAGEMENT =============
router.get('/records', authMiddleware, allowAdmin, adminController.listRecords);
router.put('/records/:id/freeze', authMiddleware, allowAdmin, adminController.freezeRecord);
router.put('/records/:id/unfreeze', authMiddleware, allowAdmin, adminController.unfreezeRecord);

// ============= AUDIT & LOGS =============
router.get('/logs', authMiddleware, allowAdmin, adminController.listLogs);

// ============= SECURITY & SUSPICIOUS DETECTION =============
router.post('/security/detect-suspicious', authMiddleware, allowAdmin, adminController.detectSuspiciousActivity);
router.get('/security/suspicious-records', authMiddleware, allowAdmin, adminController.getSuspiciousRecords);

// ============= SYSTEM FREEZE/UNFREEZE (BLOCKCHAIN SECURITY) =============
router.get('/system/status', authMiddleware, allowAdmin, adminController.getSystemStatus);
router.post('/system/freeze', authMiddleware, allowAdmin, adminController.freezeSystem);
router.post('/system/unfreeze', authMiddleware, allowAdmin, adminController.unfreezeSystem);

module.exports = router;

