const express = require('express');
const router = express.Router();
const { getPatientProfile, getPatientStats, searchPatients, updateProfile } = require('../controllers/patientController');

router.get('/search', searchPatients);              // ✅ must be before /:patientId
router.get('/profile/:patientId', getPatientProfile);
router.get('/stats/:patientId', getPatientStats);
router.put('/profile/:patientId', updateProfile);

module.exports = router;