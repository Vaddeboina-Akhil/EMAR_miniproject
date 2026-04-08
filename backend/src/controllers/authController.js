const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const generatePatientId = () => 'EMAR-P-' + Math.floor(1000 + Math.random() * 9000);
const generateDoctorId = () => 'EMAR-D-' + Math.floor(1000 + Math.random() * 9000);

const registerPatient = async (req, res) => {
  try {
    const {
      name, dob, aadhaarId, email, phone, password,
      bloodGroup, allergies, guardianContact, profileImage
    } = req.body;

    const exists = await Patient.findOne({ $or: [{ email }, { aadhaarId }] });
    if (exists) return res.status(400).json({ message: 'Patient already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const age = calculateAge(dob);
    const patientId = generatePatientId();

    const patient = await Patient.create({
      name, dob, age, aadhaarId, email, phone,
      password: hashed, bloodGroup, allergies,
      guardianContact, patientId,
      profileImage: profileImage || null
    });

    const token = generateToken(patient._id, 'patient');
    const userObj = patient.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginPatient = async (req, res) => {
  try {
    const { aadhaarId, password } = req.body;
    const patient = await Patient.findOne({ aadhaarId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const match = await bcrypt.compare(password, patient.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(patient._id, 'patient');
    const userObj = patient.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerDoctor = async (req, res) => {
  try {
    const { name, dob, licenseId, specialization, hospitalName, email, phone, password } = req.body;
    const exists = await Doctor.findOne({ $or: [{ email }, { licenseId }] });
    if (exists) return res.status(400).json({ message: 'Doctor already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const age = calculateAge(dob);
    const doctorId = generateDoctorId();
    const doctor = await Doctor.create({
      name, dob, age, licenseId, specialization,
      hospitalName, email, phone, password: hashed, doctorId
    });
    const token = generateToken(doctor._id, 'doctor');
    const userObj = doctor.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { licenseId, password } = req.body;
    const doctor = await Doctor.findOne({ licenseId });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    // Check doctor status - only approved doctors can login
    if (doctor.status !== 'approved') {
      return res.status(403).json({ 
        message: `Doctor account is ${doctor.status}. Only approved doctors can login.`,
        status: doctor.status 
      });
    }
    
    const match = await bcrypt.compare(password, doctor.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(doctor._id, 'doctor');
    const userObj = doctor.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerStaff = async (req, res) => {
  try {
    const { name, staffId, hospitalName, email, phone, password } = req.body;
    const exists = await Staff.findOne({ $or: [{ email }, { staffId }] });
    if (exists) return res.status(400).json({ message: 'Staff already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const staff = await Staff.create({ name, staffId, hospitalName, email, phone, password: hashed });
    const token = generateToken(staff._id, 'staff');
    const userObj = staff.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginStaff = async (req, res) => {
  try {
    const { staffId, password } = req.body;
    const staff = await Staff.findOne({ staffId });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(staff._id, 'staff');
    const userObj = staff.toObject();
    delete userObj.password;
    console.log('🔐 Staff Login Response - user object:', userObj);
    console.log('🏥 Hospital Name being returned:', userObj.hospitalName);
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(admin._id, 'admin');
    const userObj = admin.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed });
    const token = generateToken(admin._id, 'admin');
    const userObj = admin.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerPatient, loginPatient,
  registerDoctor, loginDoctor,
  registerStaff, loginStaff,
  loginAdmin, registerAdmin
};