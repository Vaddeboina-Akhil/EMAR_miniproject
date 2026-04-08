import api from './api';

export const patientService = {
  getPatientProfile: (patientId) => api.get(`/patients/${patientId}`),
  
  getPatientRecords: (patientId) => api.get(`/patients/${patientId}/records`),
  
  getPatientConsents: (patientId) => api.get(`/patients/${patientId}/consents`),
  
  updateProfile: (patientId, profileData) => api.put(`/patients/${patientId}`, profileData),
  
  getRecommendations: () => api.get('/patients/recommendations'),

  // Blockchain operations
  getRecordProof: (recordId) => api.get(`/records/${recordId}/proof`),
  
  verifyRecord: (recordHash) => api.post('/records/verify', { hash: recordHash })
};

export default patientService;
