const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  
  console.log('\n=== ALL DOCTORS ===');
  const doctors = await db.collection('doctors').find({}).toArray();
  doctors.forEach(d => {
    console.log('Name:', d.name);
    console.log('  LicenseID:', d.licenseId);
    console.log('  DoctorID:', d.doctorId);
    console.log('  Hospital:', d.hospitalName);
    console.log('');
  });
  
  setTimeout(() => mongoose.disconnect(), 1000);
};

connectDB().catch(e => console.error('Error:', e.message));
