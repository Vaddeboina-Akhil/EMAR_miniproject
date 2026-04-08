# EMAR Access Requests & Audit Trails - Complete Exploration

## 📋 Overview
This document maps out how access requests and audit trails are displayed and stored across the EMAR frontend and backend systems.

---

## 1️⃣ PATIENT - REQUEST ACCESS PAGE

### File Location
[frontend/src/pages/patient/RequestAccess.jsx](frontend/src/pages/patient/RequestAccess.jsx)

### Data Source (Frontend)
```javascript
// Line 71-77: Fetches consents from backend
const fetchConsents = async () => {
  try {
    const patientId = user?._id || user?.id;
    const data = await api.get(`/consent/${patientId}`);
    setConsents(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Failed to fetch consents:', err);
  } finally {
    setLoading(false);
  }
};
```

**Endpoint:** `GET /consent/:patientId`

### Displayed Data
The page displays consents in 2 sections:

#### 🕐 Pending Requests (Lines 121-198)
- Shows cards for consents with `status = 'pending'`
- Displays:
  - Doctor name (from `consent.doctorName`)
  - Request date (from `consent.requestDate`)
  - Reason for access (from `consent.reason`)
  - Hospital name (from `consent.hospitalName`)
  - Approve/Deny buttons that call `handleRespond()` to update status

#### 📋 Previous Requests (Lines 200-272)
- Shows cards for consents with `status = 'approved'` or `'denied'`
- Displays:
  - Doctor name
  - Request date
  - Reason
  - Hospital name
  - Status badge with date: ✅ "Approved on [date]" or ❌ "Denied on [date]"

### Data Update Flow
When user clicks Approve/Deny:
```javascript
// Line 82-92: Updates consent status in backend
const handleRespond = async (consentId, status) => {
  setResponding(consentId);
  try {
    await api.put(`/consent/${consentId}`, { status });
    setConsents(prev => prev.map(c =>
      c._id === consentId
        ? { ...c, status, responseDate: new Date().toISOString() }
        : c
    ));
  } catch (err) {
    alert('Failed to respond. Please try again.');
  } finally {
    setResponding(null);
  }
};
```

---

## 2️⃣ PATIENT - AUDIT TRAIL PAGE

### File Location
[frontend/src/pages/patient/AuditTrail.jsx](frontend/src/pages/patient/AuditTrail.jsx)

### Data Source (Frontend)
```javascript
// Line 81-91: Fetches audit logs from backend
const fetchLogs = async () => {
  try {
    const patientId = user?._id || user?.id;
    if (!patientId) return;
    const data = await api.get(`/access-logs/${patientId}`);
    const list = Array.isArray(data) ? data : [];
    setLogs(list);
    setFiltered(list);
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
  } finally {
    setLoading(false);
  }
};
```

**Endpoint:** `GET /access-logs/:patientId`

### Access Types Available (Lines 14-16)
```javascript
const accessTypes = ['All Types', 'requested', 'approved', 'denied', 
                      'record_uploaded', 'record_approved', 'record_rejected', 
                      'emergency', 'view'];
```

### Display Format (Lines 252-376)
Each audit log entry shows:
- **Avatar Circle** - colored by access type with emoji icon
- **Doctor Name** - (from `log.doctorName`)
- **Timestamp** - formatted date/time (from `log.timestamp`)
- **Hospital Name** - (from `log.hospitalName`)
- **Access Details Box** containing:
  - Reason for access (from `log.reason`)
  - IP Address (from `log.ipAddress`)
  - Records Accessed (from `log.recordsAccessed`)
  - **"Blockchain Hash"** - fake hash generated from `log._id` (decorative, lines 98-101)
- **Status Badge** - colored badge showing the `log.accessType`

### Type Color Mapping (Lines 17-25)
```javascript
const typeColors = {
  'requested': '#3498DB',        // Blue
  'approved': '#2ECC71',         // Green
  'denied': '#E74C3C',            // Red
  'record_uploaded': '#9B59B6',  // Purple
  'record_approved': '#27AE60',  // Dark Green
  'record_rejected': '#C0392B',  // Dark Red
  'emergency': '#F39C12',        // Orange
  'view': '#2979FF',             // Light Blue
};
```

### Filter Feature (Lines 29-40)
The page has a dropdown to filter logs by type. Line 65-67:
```javascript
const handleTypeFilter = (type) => {
  setSelectedType(type);
  setShowDropdown(false);
  if (type === 'All Types') {
    setFiltered(logs);
  } else {
    setFiltered(logs.filter(l => l.accessType === type));
  }
};
```

### Blockchain Security Banner (Lines 377-393)
Shows at bottom: "All access to your medical records is cryptographically secured and immutably logged."

---

## 3️⃣ PATIENT - DASHBOARD PAGE

### File Location
[frontend/src/pages/patient/Dashboard.jsx](frontend/src/pages/patient/Dashboard.jsx)

### Data Sources (Frontend)
```javascript
// Line 51-61: Fetches patient profile and stats
const fetchData = async () => {
  try {
    const patientId = userFromStorage?._id || userFromStorage?.id;
    
    // Fetch fresh profile data
    const profileData = await api.get(`/patient/profile/${patientId}`);
    if (profileData?.patient) {
      setUserProfile(profileData.patient);
    }
    
    // Fetch stats
    const statsData = await api.get(`/patient/stats/${patientId}`);
    if (statsData?.stats) setStats(statsData.stats);
  } catch (err) {
    console.error('Failed to fetch data:', err);
  } finally {
    setLoading(false);
  }
};
```

**Endpoints:**
- `GET /patient/profile/:patientId` → returns patient profile info
- `GET /patient/stats/:patientId` → returns `{ recordsCount, accessLogsCount }`

### Stats Display (Lines 108-110)
The dashboard shows a stat card for **"ACCESS LOGS"** with:
- Icon: 👤
- Value: `stats.accessLogsCount` (padded with leading zeros)
  
```javascript
{statCard('ACCESS LOGS', '👤', String(stats.accessLogsCount).padStart(2, '0'))}
```

### Other Major Sections
- **Patient Profile Card** - shows name, patient ID, Aadhaar, age, phone, profile image
- **Blood Group Card** - displays `userProfile?.bloodGroup`
- **Guardian Contact Card** - displays `userProfile?.guardianContact`
- **Allergies Section** - displays comma-separated allergies from `userProfile?.allergies`
- **Quick Actions** - buttons linking to Medical Records, Prescriptions, Consent, Audit Trail

---

## 4️⃣ DOCTOR - ACCESS REQUESTS PAGE

### File Location
[frontend/src/pages/doctor/AccessRequests.jsx](frontend/src/pages/doctor/AccessRequests.jsx)

### Data Source (Frontend)
```javascript
// Line 18-25: Fetches access requests sent by this doctor
const fetchAccessRequests = async () => {
  try {
    const doctorId = doctor?._id || doctor?.id;
    const data = await api.get(`/consent/doctor/${doctorId}`);
    setConsents(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('Failed to fetch access requests:', err);
  } finally {
    setLoading(false);
  }
};
```

**Endpoint:** `GET /consent/doctor/:doctorId`

### Display Features
- Filter tabs: All, Pending, Approved, Denied
- Each consent card shows:
  - Patient name
  - Request status (with icon and colored background)
  - Patient ID
  - Request date
  - Hospital name
  - Doctor notes/reason

---

## 🔌 BACKEND - ROUTES & CONTROLLERS

### Patient Routes
**File:** [backend/src/routes/patientRoutes.js](backend/src/routes/patientRoutes.js)
```javascript
router.get('/profile/:patientId', getPatientProfile);  // ← Used by Dashboard
router.get('/stats/:patientId', getPatientStats);      // ← Used by Dashboard
router.put('/profile/:patientId', updateProfile);
```

### Consent Routes
**File:** [backend/src/routes/consentRoutes.js](backend/src/routes/consentRoutes.js)
```javascript
router.post('/request', requestAccess);
router.get('/:patientId', getPatientConsents);         // ← Used by RequestAccess page
router.put('/:id', respondConsent);                     // ← Used when approving/denying
router.get('/logs/:patientId', getAccessLogs);         // ← Used by AuditTrail page
router.get('/doctor/:doctorId', getConsentsByDoctor);  // ← Used by Doctor's AccessRequests
router.post('/seed-test-logs', seedTestLogs);          // ← For testing
```

### Consent Controller
**File:** [backend/src/controllers/consentController.js](backend/src/controllers/consentController.js)

#### requestAccess() - Lines 3-16
```javascript
const requestAccess = async (req, res) => {
  try {
    const consent = await Consent.create(req.body);
    // 📝 Logs the access request
    await AccessLog.create({
      patientId: consent.patientId,
      doctorName: consent.doctorName,
      hospitalName: consent.hospitalName,
      reason: consent.reason,
      accessType: 'requested',
      timestamp: new Date()
    });
    res.status(201).json(consent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### getPatientConsents() - Lines 18-25
```javascript
const getPatientConsents = async (req, res) => {
  try {
    const consents = await Consent.find({ patientId: req.params.patientId });
    res.json(consents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### respondConsent() - Lines 27-49
```javascript
const respondConsent = async (req, res) => {
  try {
    const { status } = req.body;
    const consent = await Consent.findByIdAndUpdate(
      req.params.id,
      { status, responseDate: new Date() },
      { new: true }
    );
    // 📝 Logs the response (approved or denied)
    if (status === 'approved' || status === 'denied') {
      await AccessLog.create({
        patientId: consent.patientId,
        doctorName: consent.doctorName,
        hospitalName: consent.hospitalName,
        reason: consent.reason,
        accessType: status,
        timestamp: new Date()
      });
    }
    res.json(consent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### getAccessLogs() - Lines 51-76
```javascript
const getAccessLogs = async (req, res) => {
  try {
    const patientIdParam = req.params.patientId;
    let logs = [];
    
    // Try direct lookup first
    logs = await AccessLog.find({ patientId: patientIdParam })
      .sort({ timestamp: -1 });
    
    // If not found, try by Patient MongoDB _id
    if (logs.length === 0) {
      const Patient = require('../models/Patient');
      const patient = await Patient.findOne({ 
        $or: [{ _id: patientIdParam }, { patientId: patientIdParam }] 
      });
      if (patient) {
        logs = await AccessLog.find({ patientId: patient._id.toString() })
          .sort({ timestamp: -1 });
      }
    }
    
    res.json(logs);
  } catch (err) {
    console.error('Error fetching access logs:', err);
    res.status(500).json({ message: err.message });
  }
};
```

#### getConsentsByDoctor() - Lines 79-91
```javascript
const getConsentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const consents = await Consent.find({ doctorId })
      .populate('patientId', 'name patientId email')
      .populate('doctorId', 'name hospitalName')
      .sort({ requestDate: -1 });
    res.json(consents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### seedTestLogs() - Lines 94-141
Creates **4 hardcoded test audit log entries** when called:
```javascript
const seedTestLogs = async (req, res) => {
  try {
    const { patientId } = req.body;
    const testLogs = [
      {
        patientId,
        doctorName: 'Dr. AVK. ABHIRAMA PRANEETH',
        hospitalName: 'Rainbow Hospital',
        accessType: 'requested',
        reason: 'Patient medical check',
        recordsAccessed: 'General Checkup',
        timestamp: new Date(Date.now() - 5*24*60*60*1000)  // 5 days ago
      },
      {
        patientId,
        doctorName: 'Dr. AVK. ABHIRAMA PRANEETH',
        hospitalName: 'Rainbow Hospital',
        accessType: 'approved',
        reason: 'Access granted for patient medical check',
        recordsAccessed: 'General Checkup',
        timestamp: new Date(Date.now() - 4*24*60*60*1000)  // 4 days ago
      },
      {
        patientId,
        doctorName: 'Staff',
        hospitalName: 'Apollo Hospitals Chennai',
        accessType: 'record_uploaded',
        reason: 'Blood Test uploaded - Routine Checkup',
        recordsAccessed: 'Blood Test',
        timestamp: new Date(Date.now() - 3*24*60*60*1000)  // 3 days ago
      },
      {
        patientId,
        doctorName: 'Dr. JOHN SMITH',
        hospitalName: 'Apollo Hospitals Chennai',
        accessType: 'record_approved',
        reason: 'Blood Test approved by Dr. JOHN SMITH',
        recordsAccessed: 'Blood Test',
        timestamp: new Date(Date.now() - 2*24*60*60*1000)  // 2 days ago
      }
    ];
    await AccessLog.insertMany(testLogs);
    res.json({ message: `✅ Created ${testLogs.length} test audit logs...` });
  } catch (err) {...}
};
```

### Patient Controller
**File:** [backend/src/controllers/patientController.js](backend/src/controllers/patientController.js)

#### getPatientStats() - Lines 6-27
```javascript
exports.getPatientStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    let recordsCount = 0;  // Medical records count
    try {
      const MedicalRecord = require('../models/MedicalRecord');
      recordsCount = await MedicalRecord.countDocuments({ 
        patientId, 
        status: { $ne: 'rejected' } 
      });
    } catch (e) { recordsCount = 0; }

    let accessLogsCount = 0;  // Audit logs count
    try {
      const AccessLog = require('../models/AccessLog');
      accessLogsCount = await AccessLog.countDocuments({ patientId });
    } catch (e) { accessLogsCount = 0; }

    res.json({ patient, stats: { recordsCount, accessLogsCount } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 💾 DATABASE MODELS/SCHEMAS

### AccessLog Model
**File:** [backend/src/models/AccessLog.js](backend/src/models/AccessLog.js)

```javascript
const accessLogSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorName: { type: String },
  hospitalName: { type: String },
  accessType: { type: String },  // requested, approved, denied, record_uploaded, etc.
  reason: { type: String },
  ipAddress: { type: String },
  recordsAccessed: { type: String },
  timestamp: { type: Date, default: Date.now }
});
```

**Purpose:** Stores immutable audit trail entries for all access activity

---

### Consent Model
**File:** [backend/src/models/Consent.js](backend/src/models/Consent.js)

```javascript
const consentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientEmail: { type: String },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctorName: { type: String },
  hospitalName: { type: String },
  reason: { type: String },
  status: { type: String, default: 'pending' },  // pending, approved, denied
  requestDate: { type: Date, default: Date.now },
  responseDate: { type: Date }
});
```

**Purpose:** Stores pending and resolved access requests

---

### MedicalRecord Model
**File:** [backend/src/models/MedicalRecord.js](backend/src/models/MedicalRecord.js)

```javascript
const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  recordType: { type: String, required: true },
  diagnosis: { type: String },
  medicines: { type: String },
  notes: { type: String },
  hospitalName: { type: String },
  doctorName: { type: String },
  visitDate: { type: String },
  
  // Workflow: draft → pending → approved/rejected
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
  
  uploadedBy: { type: String },
  uploaderRole: { type: String, enum: ['staff', 'doctor'], default: 'staff' },
  
  approvedBy: { type: String },
  approvalDate: { type: Date },
  rejectionReason: { type: String },
  
  // Freeze/Flag mechanism
  isFrozen: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  
  fileUrl: { type: String },  // base64 encoded PDF
  fileName: { type: String },
  fileSize: { type: Number },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

**Purpose:** Stores medical records with approval workflow

---

### Patient Model
**File:** [backend/src/models/Patient.js](backend/src/models/Patient.js)

```javascript
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  age: { type: Number },
  aadhaarId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  bloodGroup: { type: String },
  allergies: { type: String },
  guardianContact: { type: String },
  patientId: { type: String, unique: true },
  profileImage: { type: String, default: null },  // base64 string
  role: { type: String, default: 'patient' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});
```

**Purpose:** Stores patient profile information

---

## 📊 Data Flow Diagram

```
PATIENT SIDE:
┌─────────────────────────────────────────────────────────────────┐
│                  Patient Dashboard                              │
│  - Fetches: GET /patient/stats/:patientId                       │
│  - Shows: Access Logs Count, Medical Records Count              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   AccessLogs              Patient
   (Audit Trail)           (Profile)


PATIENT REQUEST ACCESS:
┌──────────────────────────────────────────────────────┐
│         Patient Request Access Page                   │
│  - Fetches: GET /consent/:patientId                   │
│  - Filters consents by status: pending vs resolved    │
│  - On Approve/Deny: PUT /consent/:id {status}         │
└─────────────┬──────────────────────────────────────────┘
              │
              ▼
        Consent Model
        (status: pending/approved/denied)


AUDIT TRAIL GENERATION:
┌──────────────────────────────────────────────────────┐
│    1. Doctor requests access                          │
│       - POST /consent/request → Creates Consent       │
│       - Creates AccessLog with type: 'requested'      │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   2a. Patient       2b. PLUS: Records
   approves:         auto-logged when:
   - status→         - Upload record
     'approved'      - Approve record
   - Create          - Reject record
     AccessLog       - Emergency access
     type:           - View record
     'approved'


AUDIT TRAIL DISPLAY:
┌──────────────────────────────────────────────────────┐
│      Patient Audit Trail Page                         │
│  - Fetches: GET /access-logs/:patientId               │
│  - Renders: All AccessLog entries with filters        │
│  - Shows: Doctor name, hospital, type, timestamp      │
└──────────────────────────────────────────────────────┘
              │
              ▼
        AccessLog Model
        (with various accessTypes)
```

---

## 🔑 Key Findings

1. **Request Access Page**: 
   - Fetches from `Consent` model
   - Shows "Pending" (status='pending') and "Previous" (status!='pending')
   - Only displays access requests (not all audit logs)

2. **Audit Trail Page**:
   - Fetches from `AccessLog` model
   - Shows ALL activities: access requests, approvals, record uploads, approvals, rejections
   - Has 8 different access types with color coding
   - Can be tested with `/consent/seed-test-logs` endpoint (creates 4 hardcoded entries)

3. **Dashboard Page**:
   - Fetches stats count from `AccessLog.countDocuments()`
   - Displays total number of audit log entries
   - Fetches patient profile and medical records count

4. **Audit Trail Creation**:
   - Automatically created when:
     - Doctor requests access (accessType: 'requested')
     - Patient approves/denies access (accessType: 'approved'/'denied')
     - Medical records are uploaded/approved/rejected
   - Immutable design (new entries, no updates)

5. **Test Data**:
   - 4 hardcoded test entries created by `seedTestLogs()`:
     1. Access Requested (Dr. ABHIRAMA PRANEETH, 5 days ago)
     2. Access Approved (same doctor, 4 days ago)
     3. Record Uploaded (Staff, Apollo Hospitals, 3 days ago)
     4. Record Approved (Dr. JOHN SMITH, 2 days ago)

6. **Data Relationships**:
   - `Consent` (requests) → references `patientId` and `doctorId`
   - `AccessLog` (audit) → stores patientId as string, logs all activity
   - `MedicalRecord` → has approval workflow and freeze/flag mechanism

---

## 📱 Quick Reference: API Endpoints

| Endpoint | Method | Purpose | Controller |
|----------|--------|---------|-----------|
| `/patient/profile/:patientId` | GET | Get patient profile | patientController |
| `/patient/stats/:patientId` | GET | Get record & log counts | patientController |
| `/consent/:patientId` | GET | Get all consents for patient | consentController |
| `/consent/:id` | PUT | Approve/deny consent | consentController |
| `/consent/doctor/:doctorId` | GET | Get doctor's access requests | consentController |
| `/access-logs/:patientId` | GET | Get audit trail for patient | consentController |
| `/consent/request` | POST | Doctor requests access | consentController |
| `/consent/seed-test-logs` | POST | Create 4 test audit entries | consentController |

