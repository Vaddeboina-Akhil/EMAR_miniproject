import { api } from './api';

export const doctorService = {
  getDoctorDashboard: () => api.get('/doctors/dashboard'),

  getDoctorPatients: () => api.get('/doctors/me/patients'),
  
  getPatientDetails: (patientId) => api.get(`/doctors/patients/${patientId}`),
  
  getPendingApprovals: () => api.get('/doctors/pending-approvals'),
  
  approveConsent: (consentId) => api.post(`/doctors/consents/${consentId}/approve`),
  
  rejectConsent: (consentId) => api.post(`/doctors/consents/${consentId}/reject`),
  
  addRecord: (patientId, recordData) => api.post(`/doctors/records/${patientId}`, recordData),

  getDoctorProfile: () => api.get('/doctors/me')
};

export default doctorService;
