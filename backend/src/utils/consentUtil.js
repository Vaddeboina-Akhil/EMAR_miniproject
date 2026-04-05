const Consent = require('../models/Consent');

/**
 * Check if consent is valid and not expired/revoked
 */
const isConsentValid = async (consentId) => {
  const consent = await Consent.findById(consentId);
  
  if (!consent) return false;
  if (consent.status !== 'approved') return false;
  if (consent.revokedAt) return false;
  
  // Check if expired
  if (consent.expiresAt && new Date() > new Date(consent.expiresAt)) {
    // Auto-flag as expired
    consent.isExpired = true;
    await consent.save();
    return false;
  }
  
  return true;
};

/**
 * Get active consent between doctor and patient
 * Returns null if no valid consent exists
 */
const getActiveConsent = async (patientId, doctorId) => {
  const consent = await Consent.findOne({
    patientId,
    doctorId,
    status: 'approved',
    revokedAt: null
  });
  
  if (!consent) return null;
  
  // Check if expired
  if (consent.expiresAt && new Date() > new Date(consent.expiresAt)) {
    consent.isExpired = true;
    await consent.save();
    return null;
  }
  
  return consent;
};

/**
 * Filter patient data based on consent settings and emergency access
 * Returns filtered patient object with restricted fields hidden
 */
const filterPatientDataByConsent = (patient, consent, reasons = {}) => {
  if (!patient) return null;
  
  const filtered = patient.toObject ? patient.toObject() : { ...patient };
  const consentDetails = consent?.consentDetails || {};
  const isEmergency = reasons.isEmergency || false;
  
  // Emergency access overrides all restrictions
  if (isEmergency && consentDetails.emergencyAccess) {
    return { ...filtered, _metadata: { isEmergencyAccess: true } };
  }
  
  // Apply consent restrictions
  if (!consentDetails.basicInfo) {
    filtered._restricted = true;
    filtered.name = '[RESTRICTED]';
    filtered.age = null;
    filtered.bloodGroup = '[RESTRICTED]';
    filtered.aadhaarId = '[RESTRICTED]';
    filtered.phone = '[RESTRICTED]';
    filtered.dob = '[RESTRICTED]';
  }
  
  if (!consentDetails.prescriptions) {
    filtered._prescriptionsRestricted = true;
  }
  
  if (!consentDetails.fullReports) {
    filtered._reportsRestricted = true;
  }
  
  if (consent?.expiresAt) {
    filtered._metadata = filtered._metadata || {};
    filtered._metadata.consentExpiresAt = consent.expiresAt;
    filtered._metadata.daysRemaining = Math.ceil(
      (new Date(consent.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
    );
  }
  
  return filtered;
};

/**
 * Filter medical records based on consent settings
 */
const filterMedicalRecords = (records, consent) => {
  if (!records || !Array.isArray(records)) return [];
  
  const consentDetails = consent?.consentDetails || {};
  
  if (!consentDetails.prescriptions) {
    // Filter out prescription-related records
    return records.filter(r => r.recordType !== 'Prescription');
  }
  
  if (!consentDetails.fullReports) {
    // Return empty if full reports not allowed
    return [];
  }
  
  return records;
};

/**
 * Check access and return filtered response
 * Returns { patient, records, restrictions } or throws error
 */
const checkAndFilterAccess = async (patientId, doctorId, medicalRecords = []) => {
  // Check if active consent exists
  const consent = await getActiveConsent(patientId, doctorId);
  
  if (!consent) {
    return {
      status: 'restricted',
      message: 'Access denied. No valid consent found.',
      patient: null,
      records: [],
      restrictions: {
        basicInfo: true,
        prescriptions: true,
        fullReports: true,
        emergencyAccess: false
      }
    };
  }
  
  // Consent exists, filter data
  const consentDetails = consent.consentDetails;
  
  return {
    status: 'approved',
    message: 'Access approved',
    restrictions: {
      basicInfo: !consentDetails.basicInfo,
      prescriptions: !consentDetails.prescriptions,
      fullReports: !consentDetails.fullReports,
      emergencyAccess: consentDetails.emergencyAccess
    },
    consentExpiresAt: consent.expiresAt,
    consentTimeRemaining: consent.expiresAt ?
      Math.ceil((new Date(consent.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) :
      null
  };
};

/**
 * Get access summary for API responses
 */
const getAccessSummary = (consent) => {
  if (!consent) {
    return {
      hasAccess: false,
      consentStatus: 'none',
      expiresAt: null,
      restrictions: null
    };
  }
  
  return {
    hasAccess: consent.status === 'approved' && !consent.revokedAt,
    consentStatus: consent.status,
    expiresAt: consent.expiresAt,
    revokedAt: consent.revokedAt,
    restrictions: consent.consentDetails
  };
};

module.exports = {
  isConsentValid,
  getActiveConsent,
  filterPatientDataByConsent,
  filterMedicalRecords,
  checkAndFilterAccess,
  getAccessSummary
};
