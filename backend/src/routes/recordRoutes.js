const express = require('express');
const router = express.Router();
const { uploadRecord, getPatientRecords, getPendingRecords, approveRecord } = require('../controllers/recordController');

router.post('/upload', uploadRecord);
router.get('/pending/:doctorId', getPendingRecords);   // ✅ must be before /:patientId
router.get('/:patientId', getPatientRecords);
router.put('/approve/:id', approveRecord);

module.exports = router;