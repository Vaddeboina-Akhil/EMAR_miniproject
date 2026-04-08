require('dotenv').config();
const licenseId = 'MED1235';
const password = '123456';

const data = { licenseId, password };

fetch('http://localhost:5000/api/auth/doctor/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(res => {
  console.log(`📊 Status: ${res.status} ${res.statusText}`);
  return res.json();
})
.then(json => {
  console.log('📦 Response:', json);
  if (json.token) {
    console.log('✅ TOKEN RECEIVED:', json.token.substring(0, 30) + '...');
  } else {
    console.log('❌ NO TOKEN IN RESPONSE');
  }
})
.catch(err => console.error('❌ Error:', err.message));
