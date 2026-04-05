import { api } from './api';

export const recordService = {
  // Add new medical record
  addRecord: (patientId, recordData, file = null) => {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('recordData', JSON.stringify(recordData));
    if (file) formData.append('file', file);
    
    return api.request(`/records`, { 
      method: 'POST', 
      body: formData,
      headers: {} // Remove Content-Type for FormData
    });
  },

  getRecord: (recordId) => api.get(`/records/${recordId}`),
  
  getPatientRecords: (patientId) => api.get(`/patients/${patientId}/records`),
  
  updateRecord: (recordId, updates) => api.put(`/records/${recordId}`, updates),
  
  deleteRecord: (recordId) => api.delete(`/records/${recordId}`),

  // Blockchain verification
  getRecordHash: (recordId) => api.get(`/records/${recordId}/hash`),
  
  verifyRecordOnChain: (recordHash) => api.post(`/records/verify`, { hash: recordHash }),
  
  getBlockchainProof: (recordId) => api.get(`/records/${recordId}/proof`),

  // Bulk operations
  getRecordsByDateRange: (patientId, startDate, endDate) => 
    api.get(`/patients/${patientId}/records?start=${startDate}&end=${endDate}`),

  // Pending records (doctor approval workflow)
  getPendingRecords: (doctorId) => api.get(`/doctors/pending-approvals`),
  
  approveRecord: (recordId) => api.put(`/records/approve/${recordId}`, { status: 'approved' }),
  
  rejectRecord: (recordId, reason) => api.put(`/records/approve/${recordId}`, { status: 'rejected', rejectionReason: reason }),

  // Doctor-created prescriptions
  createPrescription: (prescriptionData) => api.post(`/records/prescription`, prescriptionData),

  // Doctor's own records
  getDoctorRecords: (doctorId) => api.get(`/records/doctor/${doctorId}`)
};

export default recordService;
