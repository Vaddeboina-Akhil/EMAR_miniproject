export const APP_CONSTANTS = {
  APP_NAME: 'EMAR',
  VERSION: '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
};

export const RECORD_TYPES = {
  PRESCRIPTION: 'prescription',
  LAB_RESULT: 'lab_result',
  IMAGING: 'imaging',
  DISCHARGE_SUMMARY: 'discharge_summary',
  VISIT_NOTE: 'visit_note'
};

export const CONSENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVOKED: 'revoked',
  EXPIRED: 'expired'
};

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  STAFF: 'staff',
  ADMIN: 'admin'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EMERGENCY: 'emergency'
};

export const DATE_FORMATS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  FULL: 'full'
};
