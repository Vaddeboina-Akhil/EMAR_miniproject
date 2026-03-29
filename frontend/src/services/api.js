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
    console.log(`🌐 POST ${endpoint}`, data);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: api.buildHeaders(true),
        body: JSON.stringify(data)
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
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: api.buildHeaders(false)
    });
    const payload = await parseJsonResponse(res);
    if (!res.ok) throw new Error(payload.message || `Request failed with status ${res.status}`);
    return payload;
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
