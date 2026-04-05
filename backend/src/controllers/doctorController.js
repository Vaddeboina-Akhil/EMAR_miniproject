const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Consent = require('../models/Consent');

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
};

const getDoctor = async (userId) => {
  const doctor = await Doctor.findById(userId).select('-password');
  return doctor;
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const records = await MedicalRecord.find({
      $or: [{ doctorName: doctor.name }, { hospitalName: doctor.hospitalName }]
    });
    const uniquePatientIds = new Set(records.map((r) => r.patientId).filter(Boolean));
    const pendingApprovals = records.filter((r) => r.status === 'pending').length;
    const completedCases = records.filter((r) => r.status === 'approved').length;

    res.json({
      doctor,
      stats: {
        totalPatients: uniquePatientIds.size,
        activeCases: pendingApprovals,
        completedCases
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorPatients = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const records = await MedicalRecord.find({
      $or: [{ doctorName: doctor.name }, { hospitalName: doctor.hospitalName }]
    }).sort({ createdAt: -1 });

    const byPatient = new Map();
    records.forEach((record) => {
      if (!record.patientId) return;
      if (!byPatient.has(record.patientId)) byPatient.set(record.patientId, []);
      byPatient.get(record.patientId).push(record);
    });

    const patientIds = Array.from(byPatient.keys());
    const patients = await Patient.find({ patientId: { $in: patientIds } }).select('-password');
    const patientMap = new Map(patients.map((p) => [p.patientId, p]));

    const response = patientIds.map((pid) => {
      const list = byPatient.get(pid) || [];
      const latest = list[0];
      const patient = patientMap.get(pid);
      const hasPending = list.some((item) => item.status === 'pending');
      return {
        patientId: pid,
        name: patient?.name || latest?.patientName || 'Unknown Patient',
        age: patient?.age || null,
        profileImage: patient?.profileImage || null,
        condition: latest?.diagnosis || latest?.recordType || 'General Checkup',
        lastVisit: formatDate(latest?.visitDate || latest?.createdAt),
        status: hasPending ? 'Active' : 'Completed'
      };
    });

    res.json({ patients: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientDetails = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId }).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const records = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });
    res.json({ patient, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const pendingRecords = await MedicalRecord.find({
      hospitalName: doctor.hospitalName,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json(pendingRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveConsent = async (req, res) => {
  try {
    let consent = await Consent.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!consent) {
      const record = await MedicalRecord.findByIdAndUpdate(
        req.params.id,
        { status: 'approved' },
        { new: true }
      );
      if (!record) return res.status(404).json({ message: 'Request not found' });
      return res.json({ record });
    }
    res.json({ consent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectConsent = async (req, res) => {
  try {
    let consent = await Consent.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!consent) {
      const record = await MedicalRecord.findByIdAndUpdate(
        req.params.id,
        { status: 'rejected' },
        { new: true }
      );
      if (!record) return res.status(404).json({ message: 'Request not found' });
      return res.json({ record });
    }
    res.json({ consent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addDoctorRecord = async (req, res) => {
  try {
    const doctor = await getDoctor(req.user.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const patient = await Patient.findOne({ patientId: req.params.patientId }).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const record = await MedicalRecord.create({
      patientId: patient.patientId,
      patientEmail: patient.email,
      patientName: patient.name,
      hospitalName: doctor.hospitalName,
      doctorName: doctor.name,
      status: 'approved',
      ...req.body
    });
    res.status(201).json({ record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all doctors for dropdown/selection
exports.getAllDoctors = async (req, res) => {
  try {
    const { hospital } = req.query;
    
    let query = { verified: true };
    
    // Filter by hospital if provided
    if (hospital) {
      query.hospitalName = hospital;
      console.log(`🏥 Fetching doctors from hospital: ${hospital}`);
    }
    
    const doctors = await Doctor.find(query)
      .select('_id doctorId name specialization hospitalName email phone')
      .sort({ name: 1 });
    
    console.log(`👨‍⚕️ Found ${doctors.length} verified doctors`);
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
