const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  
  console.log('\n=== CHECKING CONSENT DATA ===');
  const consent = await db.collection('consents').findOne({});
  
  if (consent) {
    console.log('Found consent:');
    console.log('  doctorId:', consent.doctorId, '(type:', typeof consent.doctorId, ')');
    console.log('  patientId:', consent.patientId, '(type:', typeof consent.patientId, ')');
    console.log('  doctorId ObjectId?', mongoose.Types.ObjectId.isValid(consent.doctorId));
    console.log('  patientId ObjectId?', mongoose.Types.ObjectId.isValid(consent.patientId));
  } else {
    console.log('No consents found');
  }
  
  await mongoose.disconnect();
};

connectDB().catch(e => console.error('Error:', e.message));
