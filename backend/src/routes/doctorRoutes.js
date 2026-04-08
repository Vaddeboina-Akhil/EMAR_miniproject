const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const doctorController = require('../controllers/doctorController');

// Public endpoint to get all doctors (for staff doctor selection)
router.get('/all', doctorController.getAllDoctors);

router.use(authMiddleware, roleMiddleware(['doctor']));

router.get('/me', doctorController.getDoctorProfile);
router.get('/dashboard', doctorController.getDoctorDashboard);
router.get('/me/patients', doctorController.getDoctorPatients);

// 📊 Dashboard Stats APIs
router.get('/dashboard-stats', doctorController.getDashboardStats); // Combined stats
router.get('/my-patients', doctorController.getMyPatients); // Get approved patients count
router.get('/access-requests', doctorController.getAccessRequests); // Get all access requests
router.get('/pending-records', doctorController.getPendingRecords); // Get pending approvals
router.get('/recent-activity', doctorController.getRecentActivity); // Get recent activity feed

// Patient Details
router.get('/my-patient/:patientId', doctorController.getMyPatientDetails);
router.get('/patients/:patientId', doctorController.getPatientDetails);

// Old endpoints
router.get('/pending-approvals', doctorController.getPendingApprovals);
router.post('/consents/:id/approve', doctorController.approveConsent);
router.post('/consents/:id/reject', doctorController.rejectConsent);
router.post('/records/:patientId', doctorController.addDoctorRecord);

module.exports = router;
