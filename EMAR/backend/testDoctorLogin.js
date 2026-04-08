const http = require('http');

const postData = JSON.stringify({
  licenseId: 'MED1235',
  password: '123456'
});

const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/doctor/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = http.request(opts, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const json = JSON.parse(data);
    if (json.token) {
      console.log('✅ LOGIN SUCCESS');
      console.log('Doctor:', json.user.name);
      console.log('Hospital:', json.user.hospitalName);
      console.log('License:', json.user.licenseId);
    } else {
      console.log(data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log('Error:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();
