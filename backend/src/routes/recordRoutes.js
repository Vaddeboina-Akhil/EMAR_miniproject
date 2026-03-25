const express = require('express');
const router = express.Router();
const { uploadRecord, getPatientRecords, approveRecord } = require('../controllers/recordController');

router.post('/upload', uploadRecord);
router.get('/:patientId', getPatientRecords);
router.put('/approve/:id', approveRecord);

module.exports = router;