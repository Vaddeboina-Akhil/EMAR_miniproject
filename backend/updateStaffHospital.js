const mongoose = require('mongoose');
const Staff = require('./src/models/Staff');
require('dotenv').config();

const updateStaffHospital = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update the staff member (Priya Sharma - ST-001)
    const result = await Staff.updateOne(
      { _id: '69c112376f7b2d2afaf9fde7' },
      { $set: { hospitalName: 'Rainbow Hospital' } }
    );

    console.log('📋 Update result:', result);
    
    if (result.modifiedCount > 0) {
      console.log('✅ Staff hospital updated to Rainbow Hospital');
      
      // Verify the update
      const updated = await Staff.findById('69c112376f7b2d2afaf9fde7');
      console.log('🏥 Updated staff data:', {
        name: updated.name,
        staffId: updated.staffId,
        hospitalName: updated.hospitalName
      });
    } else {
      console.log('⚠️ No staff member found with that ID');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

updateStaffHospital();
