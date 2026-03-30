const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Hospital = require('./src/models/Hospital');
const Doctor = require('./src/models/Doctor');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/emar';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Clear existing data (optional)
const clearData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    console.log('✅ Existing data cleared');
  } catch (err) {
    console.error('❌ Error clearing data:', err.message);
    throw err;
  }
};

// Import hospitals
const importHospitals = async () => {
  try {
    const filePath = path.join(__dirname, 'data', 'hospitals.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const hospitals = JSON.parse(fileContent);

    console.log(`📥 Importing ${hospitals.length} hospitals...`);

    // Add unique hospitalId to each hospital
    const hospitalsWithId = hospitals.map((hospital, index) => ({
      ...hospital,
      hospitalId: `HOSP${String(index + 1).padStart(4, '0')}`
    }));

    const result = await Hospital.insertMany(hospitalsWithId);
    console.log(`✅ ${result.length} hospitals imported successfully`);
    return result;
  } catch (err) {
    console.error('❌ Error importing hospitals:', err.message);
    throw err;
  }
};

// Import doctors
const importDoctors = async (hospitals) => {
  try {
    const filePath = path.join(__dirname, 'data', 'doctors.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const doctors = JSON.parse(fileContent);

    console.log(`📥 Importing ${doctors.length} doctors...`);

    // Create a map of hospital names to IDs
    const hospitalMap = {};
    hospitals.forEach(hospital => {
      hospitalMap[hospital.name] = hospital._id;
    });

    // Link doctors to hospitals
    const doctorsWithHospitalId = doctors.map((doctor, index) => {
      const hospitalId = hospitalMap[doctor.hospitalName];
      if (!hospitalId) {
        console.warn(`⚠️  Hospital not found for doctor: ${doctor.name} (${doctor.hospitalName})`);
      }
      return {
        ...doctor,
        hospitalId: hospitalId || null,
        doctorId: `DOC${String(index + 1).padStart(5, '0')}`
      };
    });

    const result = await Doctor.insertMany(doctorsWithHospitalId);
    console.log(`✅ ${result.length} doctors imported successfully`);
    return result;
  } catch (err) {
    console.error('❌ Error importing doctors:', err.message);
    throw err;
  }
};

// Main import function
const importData = async () => {
  try {
    console.log('\n🚀 Starting data import...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearData();

    // Import hospitals
    const hospitals = await importHospitals();

    // Import doctors
    await importDoctors(hospitals);

    console.log('\n✨ Data import completed successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Hospitals: ${hospitals.length}`);
    console.log(`   - Doctors: 25+ (check logs above)`);
    console.log('\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Import failed:', err.message);
    process.exit(1);
  }
};

// Run import
importData();
