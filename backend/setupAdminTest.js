const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Doctor = require('./src/models/Doctor');
const Staff = require('./src/models/Staff');
const MedicalRecord = require('./src/models/MedicalRecord');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};

const setupTestData = async () => {
  try {
    // 1. Create a pending doctor (for admin approval testing)
    const pendingDoctor = {
      name: 'Dr. Test Doctor',
      dob: '1985-05-15',
      licenseId: 'LIC_TEST_002',
      specialization: 'Cardiology',
      hospitalName: 'Test Hospital',
      email: 'testdoctor@emar.com',
      phone: '9876543210',
      password: await bcrypt.hash('test@123', 10),
      doctorId: 'TEST_DOCTOR_002',
      role: 'doctor',
      status: 'pending'
    };

    const existingDoctor = await Doctor.findOne({ licenseId: 'LIC_TEST_002' });
    if (!existingDoctor) {
      await Doctor.create(pendingDoctor);
      console.log('✅ Pending doctor created');
      console.log('   License ID: LIC_TEST_002');
      console.log('   Email: testdoctor@emar.com');
      console.log('   Status: pending (waiting for admin approval)');
    } else {
      console.log('⚠️  Doctor already exists');
    }

    // 2. Create a test staff account
    const testStaff = {
      name: 'Test Staff Member',
      staffId: 'STAFF_TEST_001',
      hospitalName: 'Test Hospital',
      email: 'staff@emar.com',
      phone: '9876543211',
      password: await bcrypt.hash('staff@123', 10),
      status: 'active'
    };

    const existingStaff = await Staff.findOne({ email: 'staff@emar.com' });
    if (!existingStaff) {
      await Staff.create(testStaff);
      console.log('\n✅ Test staff created');
      console.log('   Email: staff@emar.com');
      console.log('   Password: staff@123');
    } else {
      console.log('⚠️  Staff already exists');
    }

    // 3. Create a test record for freezing
    const testRecord = {
      patientId: 'PAT_TEST_001',
      patientEmail: 'patient@emar.com',
      patientName: 'Test Patient',
      recordType: 'Blood Report',
      diagnosis: 'Test Diagnosis',
      hospitalName: 'Test Hospital',
      doctorName: 'Dr. Test',
      status: 'approved',
      uploadedBy: 'Test Staff',
      uploaderRole: 'staff',
      isFrozen: false,
      isFlagged: false
    };

    const existingRecord = await MedicalRecord.findOne({ patientId: 'PAT_TEST_001', hospitalName: 'Test Hospital' });
    if (!existingRecord) {
      await MedicalRecord.create(testRecord);
      console.log('\n✅ Test medical record created');
      console.log('   Patient: Test Patient');
      console.log('   Status: approved');
      console.log('   (Ready for freezing/flagging test)');
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('🧪 TEST SCENARIOS YOU CAN NOW TRY:');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n1️⃣  APPROVE PENDING DOCTOR:');
    console.log('   PUT /api/admin/doctors/{id}/approve');
    console.log('   (Doctor will then be able to login)');
    console.log('\n2️⃣  REJECT DOCTOR:');
    console.log('   PUT /api/admin/doctors/{id}/reject');
    console.log('   (Doctor cannot login after rejection)');
    console.log('\n3️⃣  BLOCK DOCTOR:');
    console.log('   PUT /api/admin/doctors/{id}/block');
    console.log('   (Blocks approved/pending doctors)');
    console.log('\n4️⃣  CREATE STAFF:');
    console.log('   POST /api/admin/staff');
    console.log('   Body: { name, email, password, hospital }');
    console.log('\n5️⃣  FREEZE MEDICAL RECORD:');
    console.log('   PUT /api/admin/records/{id}/freeze');
    console.log('   Body: { reason: "suspicious..." }');
    console.log('\n6️⃣  DETECT SUSPICIOUS ACTIVITY:');
    console.log('   POST /api/admin/security/detect-suspicious');
    console.log('   (Flags rejected/frozen records)');
    console.log('\n7️⃣  VIEW ALL LOGS:');
    console.log('   GET /api/admin/logs');
    console.log('\n8️⃣  GET DASHBOARD STATS:');
    console.log('   GET /api/admin/dashboard/stats');
    console.log('\n═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

connectDB().then(setupTestData);
