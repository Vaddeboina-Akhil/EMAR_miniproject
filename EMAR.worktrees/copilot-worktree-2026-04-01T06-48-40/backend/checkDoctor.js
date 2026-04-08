const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  
  console.log('\n=== SEARCHING FOR ABHIRAMA PRANEETH ===');
  const abhirama = await db.collection('doctors').findOne({ name: { $regex: 'abhirama|praneeth|AVK', $options: 'i' } });
  
  if (abhirama) {
    console.log('✅ Found doctor:');
    console.log('   Name:', abhirama.name);
    console.log('   ID:', abhirama._id);
    console.log('   Hospital:', abhirama.hospitalName);
  } else {
    console.log('❌ Not found - all doctors in DB:');
    const all = await db.collection('doctors').find({}).toArray();
    all.forEach(d => console.log('   -', d.name, `(${d._id})`));
  }
  
  await mongoose.disconnect();
};

connectDB().catch(e => console.error('Error:', e.message));
