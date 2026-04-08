const BASE_URL = 'http://localhost:5000/api';

const parseJsonResponse = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON response (status ${res.status}): ${text.slice(0, 500)}`);
  }
};

export const api = {
  buildHeaders: (isJson = true) => {
    const headers = {};
    const token = localStorage.getItem('emar_token');
    if (isJson) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  },
  post: async (endpoint, data) => {
    console.log(`🌐 POST ${endpoint}`, data instanceof FormData ? '[FormData]' : data);
    try {
      const isFormData = data instanceof FormData;
      const headers = {};
      const token = localStorage.getItem('emar_token');
      if (token) headers.Authorization = `Bearer ${token}`;
      // Don't set Content-Type for FormData - let browser set it with boundary
      if (!isFormData) headers['Content-Type'] = 'application/json';
      
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data)
      });
      console.log(`📊 Response status: ${res.status} ${res.statusText}`);
      const payload = await parseJsonResponse(res);
      console.log(`📦 Parsed response:`, payload);
      if (!res.ok) throw new Error(payload.message || `Request failed with status ${res.status}`);
      return payload;
    } catch (err) {
      console.error(`❌ API Error on ${endpoint}:`, err);
      throw err;
    }
  },
  get: async (endpoint) => {
    console.log(`🌐 GET ${endpoint}`);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: api.buildHeaders(false)
      });
      console.log(`📊 Response status: ${res.status} ${res.statusText}`);
      const payload = await parseJsonResponse(res);
      console.log(`📦 Parsed response:`, payload);
      if (!res.ok) throw new Error(payload.message || `Request failed with status ${res.status}`);
      return payload;
    } catch (err) {
      console.error(`❌ API Error on ${endpoint}:`, err);
      throw err;
    }
  },
  put: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: api.buildHeaders(true),
      body: JSON.stringify(data)
    });
    const payload = await parseJsonResponse(res);
    if (!res.ok) throw new Error(payload.message || `Request failed with status ${res.status}`);
    return payload;
  }
};
