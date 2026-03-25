const express = require('express');
const router = express.Router();
const { getPatientProfile, getPatientStats, updateProfile } = require('../controllers/patientController');

router.get('/profile/:patientId', getPatientProfile);
router.get('/stats/:patientId', getPatientStats);
router.put('/profile/:patientId', updateProfile);

module.exports = router;