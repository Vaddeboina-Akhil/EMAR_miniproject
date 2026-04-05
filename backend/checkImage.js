const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  
  const doctor = await db.collection('doctors').findOne({ licenseId: 'MED1235' });
  
  if (doctor) {
    console.log('Doctor profileImage field:');
    console.log('  Exists?', doctor.profileImage ? 'YES' : 'NO');
    console.log('  Value type:', typeof doctor.profileImage);
    if (doctor.profileImage) {
      console.log('  Length:', String(doctor.profileImage).length);
      console.log('  First 50 chars:', String(doctor.profileImage).substring(0, 50));
    }
  }
  
  await mongoose.disconnect();
};

connectDB().catch(e => console.error(e.message));
