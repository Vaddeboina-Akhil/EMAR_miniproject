const express = require('express');
const router = express.Router();
const { requestAccess, getPatientConsents, respondConsent, getAccessLogs, getConsentsByDoctor, seedTestLogs, migrateAccessLogs, getAccessLogStats, getAuditLogs } = require('../controllers/consentController');

router.post('/request', requestAccess);
router.post('/seed-test-logs', seedTestLogs);         // ✅ TEMP TEST ENDPOINT
router.post('/migrate-access-logs', migrateAccessLogs); // ✅ MIGRATION ENDPOINT
router.get('/doctor/:doctorId', getConsentsByDoctor); // ✅ Different resource, before /:patientId
router.get('/access-logs/stats/:patientId', getAccessLogStats); // ✅ VERIFICATION — more specific route
router.get('/audit-logs/:patientId', getAuditLogs); // ✅ NEW — Patient audit trail
router.put('/:id', respondConsent);
router.get('/:patientId', getPatientConsents); // ✅ Generic get by patientId
router.get('/logs/:patientId', getAccessLogs);

module.exports = router;