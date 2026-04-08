const mongoose = require('mongoose');
const Doctor = require('./src/models/Doctor');

const mongoUri = 'mongodb+srv://EMAR_db_user:Emar2025@emar.kdoprui.mongodb.net/emar?appName=EMAR';

mongoose.connect(mongoUri).then(async () => {
  try {
    const doctors = await Doctor.find({}).select('name licenseId email hospitalName').limit(10);
    console.log('\n📋 Doctor Login Credentials:\n');
    doctors.forEach((d, i) => {
      console.log(`${i + 1}. Name: ${d.name}`);
      console.log(`   License ID: ${d.licenseId}`);
      console.log(`   Email: ${d.email}`);
      console.log('');
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
