require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./src/models/Doctor');
const bcrypt = require('bcryptjs');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const doctor = await Doctor.findOne({ licenseId: 'MED1235' });
    if (!doctor) {
      console.error('❌ Doctor not found with licenseId MED1235');
      console.log('\n📋 Available doctors:');
      const doctors = await Doctor.find().select('licenseId name');
      doctors.forEach(d => console.log(`  - ${d.licenseId}: ${d.name}`));
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Found doctor: ${doctor.name}`);
    console.log(`   License: ${doctor.licenseId}`);
    console.log(`   Has password hash: ${!!doctor.password}`);
    console.log(`   Password hash: ${doctor.password.substring(0, 30)}...`);

    console.log('\n🧪 Testing password "123456"...');
    const match = await bcrypt.compare('123456', doctor.password);
    console.log(`   Password matches: ${match}`);

    if (!match) {
      console.log('\n❌ Password does not match. Resetting to "123456"...');
      const newHash = await bcrypt.hash('123456', 10);
      doctor.password = newHash;
      await doctor.save();
      console.log('✅ Password reset successfully');
      
      const verify = await bcrypt.compare('123456', doctor.password);
      console.log(`✅ Verification: password now matches: ${verify}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

check();
