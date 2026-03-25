import api from './api';

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  signupPatient: async (patientData) => {
    const { data } = await api.post('/auth/signup/patient', patientData);
    return data;
  },

  signupDoctor: async (doctorData) => {
    const { data } = await api.post('/auth/signup/doctor', doctorData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('emar_token');
    localStorage.removeItem('emar_role');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('emar_token');
    const role = localStorage.getItem('emar_role');
    return token && role ? { token, role } : null;
  },

  verifyToken: async () => {
    try {
      await api.get('/auth/verify');
      return true;
    } catch {
      return false;
    }
  }
};

export default authService;
