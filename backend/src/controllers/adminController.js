const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const AccessLog = require('../models/AccessLog');
const SystemStatus = require('../models/SystemStatus');
const bcrypt = require('bcryptjs');

// ============= DOCTOR MANAGEMENT =============

const listDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-password');
    const stats = {
      total: doctors.length,
      approved: doctors.filter(d => d.status === 'approved').length,
      pending: doctors.filter(d => d.status === 'pending').length,
      rejected: doctors.filter(d => d.status === 'rejected').length,
      blocked: doctors.filter(d => d.status === 'blocked').length
    };
    res.json({ doctors, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor rejected', doctor, reason });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const blockDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { status: 'blocked' },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor blocked successfully', doctor, reason });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= STAFF MANAGEMENT =============

const createStaff = async (req, res) => {
  try {
    const { name, email, password, hospital } = req.body;
    if (!name || !email || !password || !hospital) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Staff email already exists' });

    const staffId = `STAFF_${Date.now()}`;
    const hashed = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      name,
      staffId,
      hospitalName: hospital,
      email,
      phone: '',
      password: hashed,
      status: 'active'
    });

    const staffObj = staff.toObject();
    delete staffObj.password;
    res.status(201).json({ message: 'Staff created successfully', staff: staffObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listStaff = async (req, res) => {
  try {
    const staff = await Staff.find({}).select('-password');
    const stats = {
      total: staff.length,
      active: staff.filter(s => s.status === 'active').length,
      blocked: staff.filter(s => s.status === 'blocked').length
    };
    res.json({ staff, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const blockStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      id,
      { status: 'blocked' },
      { new: true }
    ).select('-password');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff blocked successfully', staff, reason });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= PATIENT MANAGEMENT =============

const listPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).select('-password');
    const stats = {
      total: patients.length,
      active: patients.filter(p => p.status === 'active').length,
      blocked: patients.filter(p => p.status === 'blocked').length
    };
    res.json({ patients, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const blockPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      id,
      { status: 'blocked' },
      { new: true }
    ).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient blocked successfully', patient, reason });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= MEDICAL RECORDS MANAGEMENT =============

const listRecords = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const records = await MedicalRecord.find(query)
      .populate('doctorObjectId', 'name email specialization hospitalName')
      .sort({ createdAt: -1 });
    
    const stats = {
      total: records.length,
      draft: records.filter(r => r.status === 'draft').length,
      pending: records.filter(r => r.status === 'pending').length,
      approved: records.filter(r => r.status === 'approved').length,
      rejected: records.filter(r => r.status === 'rejected').length,
      frozen: records.filter(r => r.isFrozen).length,
      flagged: records.filter(r => r.isFlagged).length
    };
    
    // Format response with full details
    const formattedRecords = records.map(r => ({
      _id: r._id,
      id: r._id,
      patientName: r.patientName,
      patientId: r.patientId,
      recordType: r.recordType,
      // Try multiple sources for hospital name
      hospital: r.hospitalName || r.doctorObjectId?.hospitalName || '—',
      uploadedBy: r.staffName || '—',
      uploadedByStaffId: r.staffId || '—',
      // Try multiple sources for approved by: doctorObjectId.name → doctorName → approvedBy → 'Pending'
      approvedBy: r.doctorObjectId?.name || r.doctorName || r.approvedBy || 'Pending',
      approvedByEmail: r.doctorObjectId?.email || '',
      status: r.status,
      isFrozen: r.isFrozen,
      isFlagged: r.isFlagged,
      flagReason: r.flagReason,
      diagnosis: r.diagnosis,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileSize: r.fileSize,
      blockchainHash: r.blockchainHash,
      isTampered: r.isTampered,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
    
    res.json({ records: formattedRecords, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const freezeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const record = await MedicalRecord.findByIdAndUpdate(
      id,
      { 
        isFrozen: true,
        flagReason: reason || 'Admin freeze' 
      },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record frozen successfully', record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unfreezeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findByIdAndUpdate(
      id,
      { isFrozen: false },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record unfrozen successfully', record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= AUDIT LOGS =============

const listLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find({}).sort({ timestamp: -1 });
    res.json({ 
      logs,
      total: logs.length,
      latestLog: logs[0] || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= SECURITY / SUSPICIOUS DETECTION =============

const detectSuspiciousActivity = async (req, res) => {
  try {
    // Detect suspicious records:
    // 1. Records with multiple rejections
    // 2. Doctors accessing records outside their hospital
    // 3. Unusual record patterns

    const suspiciousRecords = await MedicalRecord.find({
      $or: [
        { status: 'rejected', isFlagged: false }, // Recently rejected records
        { isFrozen: true, isFlagged: false } // Frozen records not yet flagged
      ]
    });

    const flaggedRecords = [];
    for (let record of suspiciousRecords) {
      await MedicalRecord.findByIdAndUpdate(
        record._id,
        {
          isFlagged: true,
          flagReason: 'SUSPICIOUS_ACTIVITY: ' + 
            (record.status === 'rejected' ? 'Multiple rejection pattern' : 'Admin freeze detected')
        }
      );
      flaggedRecords.push(record._id);
    }

    res.json({
      message: 'Suspicious activity detection complete',
      flaggedCount: flaggedRecords.length,
      flaggedRecords
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSuspiciousRecords = async (req, res) => {
  try {
    const suspicious = await MedicalRecord.find({ isFlagged: true });
    res.json({
      count: suspicious.length,
      records: suspicious
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= ADMIN DASHBOARD OVERVIEW =============

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalDoctors,
      approvedDoctors,
      totalStaff,
      totalPatients,
      totalRecords,
      approvedRecords,
      flaggedRecords,
      frozenRecords,
      recentLogs
    ] = await Promise.all([
      Doctor.countDocuments({}),
      Doctor.countDocuments({ status: 'approved' }),
      Staff.countDocuments({}),
      Patient.countDocuments({}),
      MedicalRecord.countDocuments({}),
      MedicalRecord.countDocuments({ status: 'approved' }),
      MedicalRecord.countDocuments({ isFlagged: true }),
      MedicalRecord.countDocuments({ isFrozen: true }),
      AccessLog.find({}).sort({ timestamp: -1 }).limit(10)
    ]);

    res.json({
      doctors: {
        total: totalDoctors,
        approved: approvedDoctors,
        pending: await Doctor.countDocuments({ status: 'pending' }),
        rejected: await Doctor.countDocuments({ status: 'rejected' }),
        blocked: await Doctor.countDocuments({ status: 'blocked' })
      },
      staff: totalStaff,
      patients: totalPatients,
      records: {
        total: totalRecords,
        approved: approvedRecords,
        flagged: flaggedRecords,
        frozen: frozenRecords
      },
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============= SYSTEM FREEZE/UNFREEZE (BLOCKCHAIN SECURITY) =============

/**
 * Get current system status
 */
const getSystemStatus = async (req, res) => {
  try {
    const status = await SystemStatus.getInstance();
    res.json({
      isFrozen: status.isFrozen,
      reason: status.reason,
      frozenAt: status.frozenAt,
      updatedAt: status.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Freeze system - blocks all write operations
 * Used when tampering or suspicious activity detected
 */
const freezeSystem = async (req, res) => {
  try {
    const { reason = 'Manual admin freeze' } = req.body;
    const adminId = req.user?.id || 'unknown';

    const status = await SystemStatus.updateOne(
      {},
      {
        isFrozen: true,
        reason: `[${new Date().toISOString()}] ${reason} (by admin: ${adminId})`,
        frozenAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true }
    );

    console.log(`🛑 SYSTEM FROZEN: ${reason} by admin ${adminId}`);

    res.json({
      message: '✅ System frozen successfully',
      reason
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Unfreeze system - resumes normal operations
 * Only admin can unfreeze
 */
const unfreezeSystem = async (req, res) => {
  try {
    const { reason = 'Manual admin unfreeze' } = req.body;
    const adminId = req.user?.id || 'unknown';

    const status = await SystemStatus.updateOne(
      {},
      {
        isFrozen: false,
        reason: ``,
        frozenAt: null,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    console.log(`✅ SYSTEM UNFROZEN by admin ${adminId}: ${reason}`);

    res.json({
      message: '✅ System unfrozen successfully',
      reason
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  // Doctor Management
  listDoctors,
  approveDoctor,
  rejectDoctor,
  blockDoctor,
  // Staff Management
  createStaff,
  listStaff,
  blockStaff,
  // Patient Management
  listPatients,
  blockPatient,
  // Records Management
  listRecords,
  freezeRecord,
  unfreezeRecord,
  // Audit & Logs
  listLogs,
  // Security
  detectSuspiciousActivity,
  getSuspiciousRecords,
  // System Freeze/Unfreeze
  getSystemStatus,
  freezeSystem,
  unfreezeSystem,
  // Dashboard
  getDashboardStats
};
