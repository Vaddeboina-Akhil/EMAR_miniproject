import api from './api';

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
    api.get(`/patients/${patientId}/records?start=${startDate}&end=${endDate}`)
};

export default recordService;
