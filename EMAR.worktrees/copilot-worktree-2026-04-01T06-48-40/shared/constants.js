// Shared constants across frontend and backend
export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  STAFF: 'staff',
  ADMIN: 'admin'
};

export const RECORD_TYPES = {
  PRESCRIPTION: 'prescription',
  LAB_RESULT: 'lab_result',
  IMAGING: 'imaging',
  DISCHARGE_SUMMARY: 'discharge_summary'
};

export const CONSENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVOKED: 'revoked'
};

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://emar-api-production.com' 
  : 'http://localhost:5000/api';
