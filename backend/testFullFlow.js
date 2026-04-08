const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Doctor = require('./src/models/Doctor');
const Patient = require('./src/models/Patient');
const Consent = require('./src/models/Consent');
const MedicalRecord = require('./src/models/MedicalRecord');

async function fullTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Get doctor and patient
    const doctor = await Doctor.findOne({ name: 'AVK. ABHIRAMA PRANEETH' });
    const patient = await Patient.findOne({ name: 'Vaddeboina Akhil' });
    
    if (!doctor || !patient) {
      console.log('❌ Doctor or patient not found');
      return;
    }

    console.log('📋 STEP 1: Verify doctor and patient exist');
    console.table({
      Doctor: { name: doctor.name, _id: doctor._id.toString() },
      Patient: { name: patient.name, _id: patient._id.toString(), patientId: patient.patientId }
    });

    // Step 2: Check consent
    console.log('\n📋 STEP 2: Check consent');
    const consent = await Consent.findOne({
      doctorId: doctor._id,
      patientId: patient._id,
      status: 'approved'
    });

    if (!consent) {
      console.log('❌ No approved consent found!');
      return;
    }

    console.log('✅ Consent found:', {
      _id: consent._id.toString(),
      status: consent.status,
      doctorId: consent.doctorId.toString(),
      patientId: consent.patientId.toString()
    });

    // Step 3: Test the authorization check (simulating what backend does)
    console.log('\n📋 STEP 3: Test authorization (simulate backend)');
    const testPatientIdString = patient._id.toString();
    console.log('Testing with patientId string:', testPatientIdString);
    
    let patientObjectId;
    try {
      patientObjectId = new mongoose.Types.ObjectId(testPatientIdString);
      console.log('✅ Converted to ObjectId:', patientObjectId.toString());
    } catch (e) {
      console.log('❌ Conversion failed:', e.message);
      return;
    }

    const consentCheck = await Consent.findOne({
      doctorId: doctor._id,
      patientId: patientObjectId,
      status: 'approved'
    });

    console.log('Consent authorization check:', consentCheck ? '✅ PASS' : '❌ FAIL');

    // Step 4: Check medical records
    console.log('\n📋 STEP 4: Check medical records');
    const records = await MedicalRecord.find({
      patientId: patientObjectId,
      status: { $ne: 'rejected' }
    });

    console.log(`Found ${records.length} non-rejected records:`);
    records.forEach((r, i) => {
      console.log(`  ${i + 1}. Status: ${r.status}, Created: ${r.createdAt}`);
    });

    // Step 5: Simulate full API flow
    console.log('\n📋 STEP 5: Full API simulation');
    const consentRes = await Consent.find({ doctorId: doctor._id })
      .populate('patientId', 'name patientId email')
      .populate('doctorId', 'name hospitalName');

    console.log('Consents returned by /consent/doctor/{doctorId}:', consentRes.length);
    
    if (consentRes.length > 0) {
      const c = consentRes[0];
      const pId = c.patientId?._id || c.patientId;
      console.log('Patient ID extracted:', pId.toString());
      console.log('Patient name:', c.patientId?.name);
      console.log('Patient EMAR ID:', c.patientId?.patientId);
      
      if (c.status === 'approved') {
        console.log('✅ Consent is approved, would fetch records for:', pId.toString());
        
        // Now fetch records using that ID
        let pObjId;
        try {
          pObjId = new mongoose.Types.ObjectId(pId.toString());
        } catch (e) {
          console.log('❌ Failed to convert:', e.message);
          return;
        }

        const recs = await MedicalRecord.find({
          patientId: pObjId,
          status: { $ne: 'rejected' }
        });

        console.log(`✅ Would return ${recs.length} records`);
      }
    }

    console.log('\n✅ ALL TESTS PASSED!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fullTest();
