import api from './api';

export const hospitalService = {
  getNearbyHospitals: (lat, lng, radius = 10) => 
    api.get(`/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  
  getHospital: (hospitalId) => api.get(`/hospitals/${hospitalId}`),
  
  getHospitalDoctors: (hospitalId) => api.get(`/hospitals/${hospitalId}/doctors`),
  
  searchHospitals: (query, specialty = null) => {
    const params = new URLSearchParams({ q: query });
    if (specialty) params.append('specialty', specialty);
    return api.get(`/hospitals/search?${params}`);
  },

  getRecommendations: (patientId) => api.get(`/patients/${patientId}/hospital-recommendations`),

  rateHospital: (hospitalId, rating, review) => 
    api.post(`/hospitals/${hospitalId}/reviews`, { rating, review })
};

export default hospitalService;
