const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Consent = require('./src/models/Consent');

async function testAPIResponse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const doctorId = '69cbf4888751926cce1e4e67'; // AVK. ABHIRAMA PRANEETH

    // This is what the API endpoint returns
    const consents = await Consent.find({ doctorId })
      .populate('patientId', 'name patientId email')
      .populate('doctorId', 'name hospitalName')
      .sort({ requestDate: -1 });

    console.log('\n📋 API RESPONSE (getConsentsByDoctor):');
    console.log(JSON.stringify(consents, null, 2));

    // Test what the frontend extracts
    if (consents.length > 0) {
      const c = consents[0];
      console.log('\n✅ Testing frontend extraction:');
      console.log('c.patientId:', c.patientId);
      console.log('c.patientId._id:', c.patientId?._id);
      console.log('c.patientId?.name:', c.patientId?.name);
      console.log('c.patientId?.patientId:', c.patientId?.patientId);
      console.log('c.status:', c.status);
      
      // Check if it would be filtered
      console.log('\nWould be filtered (status === "approved"):', c.status === 'approved');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testAPIResponse();
