const express = require('express');
const router = express.Router();
const { requestAccess, getPatientConsents, respondConsent, getAccessLogs, getConsentsByDoctor } = require('../controllers/consentController');

router.post('/request', requestAccess);
router.get('/doctor/:doctorId', getConsentsByDoctor);    // ✅ NEW — before /:patientId
router.get('/:patientId', getPatientConsents);
router.put('/:id', respondConsent);
router.get('/logs/:patientId', getAccessLogs);

module.exports = router;