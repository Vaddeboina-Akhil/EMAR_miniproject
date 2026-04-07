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
// 👥 NEW: Get my approved patients (for "My Patients" page)
router.get('/my-patients', doctorController.getMyPatients);
// 👤 NEW: Get my patient details (approved access, no request needed)
router.get('/my-patient/:patientId', doctorController.getMyPatientDetails);
// OLD: Search for patients
router.get('/patients/:patientId', doctorController.getPatientDetails);
router.get('/pending-approvals', doctorController.getPendingApprovals);
router.post('/consents/:id/approve', doctorController.approveConsent);
router.post('/consents/:id/reject', doctorController.rejectConsent);
router.post('/records/:patientId', doctorController.addDoctorRecord);

module.exports = router;
