const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');

// 📋 STAFF: Create record in DRAFT status
const createDraftRecord = async (req, res) => {
  try {
    const {
      patientId, patientName, patientEmail, recordType, diagnosis,
      medicines, notes, hospitalName, staffId, staffName
    } = req.body;

    const record = await MedicalRecord.create({
      patientId,
      patientName,
      patientEmail,
      recordType,
      diagnosis,
      medicines,
      notes,
      hospitalName,
      staffId,
      staffName,
      status: 'draft',
      uploadedBy: staffId,
      uploaderRole: 'staff'
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 STAFF: Submit record (draft → pending)
const submitRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.findById(id);

    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft records can be submitted' });
    }

    const updated = await MedicalRecord.findByIdAndUpdate(
      id,
      { status: 'pending', updatedAt: new Date() },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 STAFF: View all records created by this staff
const getStaffRecords = async (req, res) => {
  try {
    const { staffId } = req.params;
    const records = await MedicalRecord.find({ staffId })
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// STAFF UPLOAD: Staff uploads records (requires doctor approval)
const uploadRecord = async (req, res) => {
  try {
    const {
      patientId, patientName, recordType, diagnosis,
      medicines, notes, hospitalName, staffId, staffName, doctorId, doctorName, visitDate
    } = req.body;

    let fileData = null;
    let fileName = null;
    let fileSize = null;
    
    // If file is uploaded, convert to base64
    if (req.file) {
      fileData = req.file.buffer.toString('base64');
      fileName = req.file.originalname;
      fileSize = req.file.size;
      console.log(`📄 PDF received: ${fileName} (${fileSize} bytes)`);
    }

    // Look up doctor's MongoDB _id if doctorId is provided
    let doctorObjectId = null;
    if (doctorId) {
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        doctorObjectId = doctor._id;
      }
      console.log(`👨‍⚕️ Doctor assigned: ${doctorName} (ID: ${doctorId})`);
    }

    // STAFF UPLOADS GO TO PENDING STATUS (require approval)
    const record = await MedicalRecord.create({
      patientId,
      patientName,
      recordType,
      diagnosis,
      medicines: medicines || '',
      notes: notes || '',
      hospitalName,
      staffId,
      staffName,
      doctorId: doctorId || '',
      doctorName: doctorName || '',
      doctorObjectId: doctorObjectId || null,
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      status: 'pending', // Staff uploads go DIRECTLY to pending (no draft stage for this flow)
      uploadedBy: staffId,
      uploaderRole: 'staff',
      fileUrl: fileData ? `data:application/pdf;base64,${fileData}` : null,
      fileName,
      fileSize
    });

    res.status(201).json({
      message: '✅ Record submitted for approval',
      record
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: err.message });
  }
};

// DOCTOR PRESCRIPTION: Doctor creates prescriptions directly (auto-approved, bypass staff approval)
const createPrescription = async (req, res) => {
  try {
    const {
      patientId, patientName, recordType, diagnosis,
      medicines, notes, hospitalName, doctorId, doctorName, visitDate
    } = req.body;

    const Doctor = require('../models/Doctor');
    let doctorObjectId = null;
    if (doctorId) {
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        doctorObjectId = doctor._id;
      }
    }

    // DOCTOR PRESCRIPTIONS ARE AUTO-APPROVED (bypass approval workflow)
    const record = await MedicalRecord.create({
      patientId,
      patientName,
      recordType: recordType || 'Prescription',
      diagnosis,
      medicines: medicines || '',
      notes: notes || '',
      hospitalName,
      doctorId: doctorId || '',
      doctorName: doctorName || '',
      doctorObjectId: doctorObjectId || null,
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      status: 'approved', // DOCTOR PRESCRIPTIONS ARE DIRECTLY APPROVED
      uploadedBy: doctorId,
      uploaderRole: 'doctor',
      approvedBy: doctorId,
      approvalDate: new Date()
    });

    console.log(`📋 Doctor prescription created and auto-approved: ${recordType}`);
    res.status(201).json({
      message: '✅ Prescription created successfully',
      record
    });
  } catch (err) {
    console.error('Prescription error:', err);
    res.status(500).json({ message: err.message });
  }
};

// 👤 PATIENT: Only see APPROVED records
const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patientId: req.params.patientId,
      status: 'approved'  // Only approved records
    }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👨‍⚕️ DOCTOR: Get pending records for approval
const getPendingRecords = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // First try to find records assigned to this specific doctor
    let records = await MedicalRecord.find({
      status: 'pending',
      doctorObjectId: doctor._id
    }).sort({ createdAt: -1 });

    // If no specifically assigned records, fall back to hospital-based records
    if (records.length === 0) {
      records = await MedicalRecord.find({
        status: 'pending',
        hospitalName: doctor.hospitalName
      }).sort({ createdAt: -1 });
    }

    console.log(`📋 Found ${records.length} pending records for doctor ${doctor.name}`);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👨‍⚕️ DOCTOR: Approve or reject record
const approveRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const { doctorId, doctorName } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = {
      status,
      approvedBy: doctorId,
      approvalDate: new Date(),
      updatedAt: new Date()
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || 'No reason provided';
    }

    const record = await MedicalRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👨‍⚕️ DOCTOR: Get all records added by this doctor
const getRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Try to find using doctorObjectId first (MongoDB ObjectId)
    let records = await MedicalRecord.find({ doctorObjectId: doctorId })
      .sort({ createdAt: -1 });
    
    // Fall back to searching by doctorId string if no results
    if (records.length === 0) {
      records = await MedicalRecord.find({ doctorId })
        .sort({ createdAt: -1 });
    }
    
    console.log(`📋 Found ${records.length} records for doctor ${doctorId}`);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👤 PATIENT: Download record file
const downloadRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    console.log(`📥 Download request for record: ${recordId}`);
    
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      console.error(`❌ Record not found: ${recordId}`);
      return res.status(404).json({ message: 'Record not found' });
    }

    console.log(`✅ Record found: ${record.diagnosis}`);

    // Check if record has a file
    if (!record.fileUrl) {
      console.error(`❌ No fileUrl for record: ${recordId}`);
      return res.status(404).json({ message: 'No file attached to this record' });
    }

    if (!record.fileName) {
      console.error(`❌ No fileName for record: ${recordId}`);
      return res.status(404).json({ message: 'No filename attached to this record' });
    }

    console.log(`📄 Extracting base64 data for file: ${record.fileName}`);

    // Extract base64 data from fileUrl (format: "data:application/pdf;base64,...")
    let base64Data = record.fileUrl;
    
    // If it starts with data URI format, extract the base64 part
    if (base64Data.startsWith('data:application/pdf;base64,')) {
      base64Data = base64Data.replace(/^data:application\/pdf;base64,/, '');
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    console.log(`✅ Buffer created: ${buffer.length} bytes`);

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${record.fileName}"`);
    res.setHeader('Content-Length', buffer.length);

    console.log(`📤 Sending PDF: ${record.fileName}`);
    res.send(buffer);
  } catch (err) {
    console.error('❌ Download error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDraftRecord,
  submitRecord,
  getStaffRecords,
  uploadRecord,
  createPrescription,
  getPatientRecords,
  getPendingRecords,
  approveRecord,
  getRecordsByDoctor,
  downloadRecord
};