const mongoose = require('mongoose');
require('dotenv').config();

const Consent = require('./src/models/Consent');
const Patient = require('./src/models/Patient');
const Doctor = require('./src/models/Doctor');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

const setupProperConsent = async () => {
  try {
    // Get the currently logged-in doctor
    const loggedInDoctorId = process.argv[2];
    if (!loggedInDoctorId) {
      console.log('❌ Usage: node setupProperConsent.js <doctorId>');
      console.log('\nExample: node setupProperConsent.js 69cbf4888751926cce1e4e67');
      process.exit(1);
    }

    // Get doctor and patient
    const doctor = await Doctor.findById(loggedInDoctorId);
    const patient = await Patient.findOne({ name: { $regex: 'vaddeboina', $options: 'i' } });

    if (!doctor) {
      console.log(`❌ Doctor with ID ${loggedInDoctorId} not found`);
      process.exit(1);
    }
    if (!patient) {
      console.log('❌ Patient Vaddeboina Akhil not found');
      process.exit(1);
    }

    console.log(`\n📋 Setting up consent for:`);
    console.log(`   Doctor: ${doctor.name}`);
    console.log(`   Patient: ${patient.name}`);

    // Delete any bad consents for this patient
    const deleted = await Consent.deleteMany({
      patientId: patient._id,
      $or: [
        { doctorId: patient._id }, // Delete if doctor = patient
        { doctorId: null }
      ]
    });
    console.log(`\n🗑️  Cleaned up ${deleted.deletedCount} corrupted consent records`);

    // Check if valid consent already exists
    const existing = await Consent.findOne({
      patientId: patient._id,
      doctorId: doctor._id
    });

    if (existing) {
      console.log(`\n✅ Consent already exists between this doctor and patient`);
      console.log(`   Status: ${existing.status}`);
      if (existing.status !== 'approved') {
        existing.status = 'approved';
        existing.responseDate = new Date();
        await existing.save();
        console.log(`   ✅ Updated to APPROVED`);
      }
    } else {
      // Create new consent
      const consent = await Consent.create({
        patientId: patient._id,
        doctorId: doctor._id,
        hospitalName: doctor.hospitalName,
        doctorName: doctor.name,
        reason: 'Patient records access request',
        status: 'approved',
        consentDetails: {
          basicInfo: true,
          prescriptions: true,
          fullReports: true,
          emergencyAccess: false
        },
        requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        responseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      console.log(`\n✅ Created new APPROVED consent`);
      console.log(`   Expires in: 30 days`);
    }

    // Verify 
    const check = await Consent.find({
      patientId: patient._id,
      doctorId: doctor._id
    }).populate('doctorId', 'name');

    console.log(`\n✅ Verification: Found ${check.length} valid consent(s)`);
    check.forEach(c => {
      console.log(`   - Status: ${c.status}`);
    });

    console.log(`\n🎯 READY TO TEST!`);
    console.log(`   Go to Access Requests tab`);
    console.log(`   You should now see "${patient.name}" with APPROVED status`);
    console.log(`   Click "View Patient Records" to see their medical records`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

connectDB().then(() => setupProperConsent());
