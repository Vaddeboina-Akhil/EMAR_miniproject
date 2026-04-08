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

// 👥 Get doctor's approved patients (MY PATIENTS)
exports.getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;
    
    // Get all APPROVED consents for this doctor
    const approvedConsents = await Consent.find({
      doctorId: doctorId,
      status: 'approved'
    }).populate('patientId', 'name patientId email');

    res.json(approvedConsents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 👤 Get MY patient details (no second request needed)
exports.getMyPatientDetails = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;
    const { patientId } = req.params;
    const mongoose = require('mongoose');

    // Convert patientId to ObjectId
    let patientObjectId;
    try {
      patientObjectId = new mongoose.Types.ObjectId(patientId);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    // Verify doctor has APPROVED consent for this patient
    const consent = await Consent.findOne({
      doctorId: doctorId,
      patientId: patientObjectId,
      status: 'approved'
    });

    if (!consent) {
      return res.status(403).json({ message: 'You do not have approved access to this patient' });
    }

    // Get patient details
    const patient = await Patient.findById(patientObjectId).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient records
    const records = await MedicalRecord.find({
      patientId: patientObjectId,
      status: { $ne: 'rejected' }
    }).sort({ createdAt: -1 });

    res.json({
      patient,
      records,
      consent: {
        status: consent.status,
        approvedAt: consent.responseDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get all access requests (consents) sent by this doctor
exports.getAccessRequests = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;

    const requests = await Consent.find({
      doctorId: doctorId
    })
      .populate('patientId', 'name patientId email')
      .sort({ createdAt: -1 });

    res.json({ requests, total: requests.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ⏳ Get pending records for this doctor (awaiting approval)
exports.getPendingRecords = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;

    // Get doctor info to filter by hospital
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const pendingRecords = await MedicalRecord.find({
      hospitalName: doctor.hospitalName,
      status: 'pending'
    })
      .populate('doctorObjectId', 'name')
      .sort({ createdAt: -1 });

    res.json({ records: pendingRecords, total: pendingRecords.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Get recent activity for this doctor
// 📊 Get dashboard stats: patient count, access requests, pending approvals
exports.getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;

    // 1. Count ALL access requests (pending + approved + rejected)
    const accessRequests = await Consent.countDocuments({
      doctorId: doctorId
    });

    // 2. Count approved patients only
    const myPatients = await Consent.countDocuments({
      doctorId: doctorId,
      status: 'approved'
    });

    // 3. Count pending approvals
    const doctor = await Doctor.findById(doctorId);
    let pendingApprovals = 0;
    if (doctor) {
      pendingApprovals = await MedicalRecord.countDocuments({
        hospitalName: doctor.hospitalName,
        status: 'pending'
      });
    }

    res.json({
      accessRequests,
      myPatients,
      pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🕐 Get recent activity combining consents and records
exports.getRecentActivity = async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;

    // 1. Get approved access requests (consents)
    const approvedConsents = await Consent.find({
      doctorId: doctorId,
      status: 'approved'
    })
      .populate('patientId', 'name patientId')
      .sort({ responseDate: -1 })
      .limit(5);

    // 2. Get recently uploaded records by this doctor
    const recordsUploaded = await MedicalRecord.find({
      doctorId: doctorId
    })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Format consent activities
    const consentActivities = approvedConsents.map(consent => ({
      type: 'ACCESS_APPROVED',
      patientName: consent.patientId?.name || 'Unknown Patient',
      timestamp: consent.responseDate || consent.updatedAt || consent.createdAt,
      icon: '✅',
      action: `Access granted by ${consent.patientId?.name || 'Unknown Patient'}`
    }));

    // 4. Format record activities
    const recordActivities = recordsUploaded.map(record => ({
      type: 'RECORD_UPLOADED',
      patientName: record.patientId?.name || record.patientName || 'Unknown Patient',
      timestamp: record.createdAt,
      icon: '📄',
      action: `Record uploaded for ${record.patientId?.name || record.patientName || 'Unknown Patient'}`
    }));

    // 5. Combine and sort by timestamp (newest first)
    const combined = [...consentActivities, ...recordActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(activity => ({
        action: activity.action,
        patientName: activity.patientName,
        timestamp: activity.timestamp,
        icon: activity.icon,
        actionType: activity.type
      }));

    res.json({ activities: combined.length > 0 ? combined : [] });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: error.message });
  }
};

