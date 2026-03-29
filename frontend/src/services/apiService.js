import { api } from './api';

/**
 * 🔐 AUTHENTICATION SERVICES
 */
export const authService = {
  // Patient Auth
  patientLogin: async (aadhaarId, password) => {
    const res = await api.post('/auth/patient/login', { aadhaarId, password });
    if (res.token) {
      localStorage.setItem('emar_token', res.token);
      localStorage.setItem('emar_role', 'patient');
      localStorage.setItem('emar_user', JSON.stringify(res.user));
    }
    return res;
  },

  patientRegister: async (data) => {
    const res = await api.post('/auth/patient/register', data);
    if (res.token) {
      localStorage.setItem('emar_token', res.token);
      localStorage.setItem('emar_role', 'patient');
      localStorage.setItem('emar_user', JSON.stringify(res.user));
    }
    return res;
  },

  // Doctor Auth
  doctorLogin: async (licenseId, password) => {
    const res = await api.post('/auth/doctor/login', { licenseId, password });
    if (res.token) {
      localStorage.setItem('emar_token', res.token);
      localStorage.setItem('emar_role', 'doctor');
      localStorage.setItem('emar_user', JSON.stringify(res.user));
    }
    return res;
  },

  doctorRegister: async (data) => {
    const res = await api.post('/auth/doctor/register', data);
    if (res.token) {
      localStorage.setItem('emar_token', res.token);
      localStorage.setItem('emar_role', 'doctor');
      localStorage.setItem('emar_user', JSON.stringify(res.user));
    }
    return res;
  },

  // Staff Auth
  staffLogin: async (staffId, password) => {
    console.log('📡 Calling /auth/staff/login with:', { staffId });
    const res = await api.post('/auth/staff/login', { staffId, password });
    console.log('📦 Response:', res);
    if (res.token) {
      console.log('💾 Storing token...');
      localStorage.setItem('emar_token', res.token);
      localStorage.setItem('emar_role', 'staff');
      localStorage.setItem('emar_user', JSON.stringify(res.user));
      console.log('✅ Token stored');
    } else {
      console.warn('⚠️ No token in response');
    }
    return res;
  },

  staffRegister: async (data) => {
    const res = await api.post('/auth/staff/register', data);
    if (res.token) {
      localStorage.setItem('emar_token', res.token);
      localStorage.setItem('emar_role', 'staff');
      localStorage.setItem('emar_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('emar_token');
    localStorage.removeItem('emar_role');
    localStorage.removeItem('emar_user');
  }
};

/**
 * 📋 RECORDS SERVICES
 */
export const recordService = {
  // STAFF: Create draft record
  createDraft: async (recordData) => {
    return api.post('/records/staff/create-draft', recordData);
  },

  // STAFF: Submit draft → pending
  submitRecord: async (recordId) => {
    return api.put(`/records/staff/submit/${recordId}`, {});
  },

  // STAFF: View own records
  getStaffRecords: async (staffId) => {
    return api.get(`/records/staff/${staffId}`);
  },

  // DOCTOR: Get pending records
  getPendingRecords: async (doctorId) => {
    return api.get(`/records/pending/${doctorId}`);
  },

  // DOCTOR: Approve record
  approveRecord: async (recordId, doctorId, doctorName) => {
    return api.put(`/records/approve/${recordId}`, {
      status: 'approved',
      doctorId,
      doctorName
    });
  },

  // DOCTOR: Reject record
  rejectRecord: async (recordId, doctorId, rejectionReason) => {
    return api.put(`/records/approve/${recordId}`, {
      status: 'rejected',
      doctorId,
      rejectionReason
    });
  },

  // DOCTOR: Get own records
  getRecordsByDoctor: async (doctorId) => {
    return api.get(`/records/doctor/${doctorId}`);
  },

  // PATIENT: Get approved records
  getPatientRecords: async (patientId) => {
    return api.get(`/records/${patientId}`);
  }
};

/**
 * 👤 PATIENT SERVICES
 */
export const patientService = {
  getProfile: async (patientId) => {
    return api.get(`/patient/${patientId}`);
  },

  updateProfile: async (patientId, data) => {
    return api.put(`/patient/${patientId}`, data);
  }
};

/**
 * 👨‍⚕️ DOCTOR SERVICES
 */
export const doctorService = {
  getProfile: async (doctorId) => {
    return api.get(`/doctors/${doctorId}`);
  },

  searchPatients: async (query) => {
    return api.get(`/doctors/search?q=${query}`);
  }
};

export default {
  authService,
  recordService,
  patientService,
  doctorService
};
