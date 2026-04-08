const express = require('express');
const router = express.Router();
const { 
  getConsentSettings, 
  updateConsentSettings, 
  getActiveConsents,
  getAccessHistory,
  getPendingConsents,
  getAllConsents
} = require('../controllers/patientConsentController');

// Get patient's default consent settings
router.get('/:patientId/settings', getConsentSettings);

// Update patient's default consent settings
router.put('/:patientId/settings', updateConsentSettings);

// Get all active consents for patient
router.get('/:patientId/active', getActiveConsents);

// Get pending consent requests
router.get('/:patientId/pending', getPendingConsents);

// Get all consents grouped by status
router.get('/:patientId/all', getAllConsents);

// Get access history
router.get('/:patientId/history', getAccessHistory);

module.exports = router;
