# Admin Functional APIs - System Control

## Overview
Complete admin system for managing users, approvals, records, and monitoring. Admins have full control over:
- Doctor approvals and verification
- Staff account creation & management
- Patient access control
- Medical record freezing/flagging
- Audit logs & security monitoring

---

## 🔐 Authentication
All admin endpoints require:
1. Valid JWT token with role='admin'
2. Header: `Authorization: Bearer {token}`

**Admin Credentials:**
- Email: `admin@emar.com`
- Password: `admin@123`

---

## 1. DOCTOR MANAGEMENT

### List All Doctors
```
GET /api/admin/doctors
```
**Returns:** List of all doctors with status breakdown
```json
{
  "doctors": [
    {
      "_id": "...",
      "name": "Dr. Name",
      "email": "doctor@emar.com",
      "licenseId": "LIC123",
      "status": "pending",
      "createdAt": "..."
    }
  ],
  "stats": {
    "total": 10,
    "approved": 5,
    "pending": 3,
    "rejected": 1,
    "blocked": 1
  }
}
```

### Doctor Workflow: pending → approved → can login
```
1. Doctor signs up → status = "pending"
2. Admin reviews → PUT /api/admin/doctors/{id}/approve
3. Doctor status = "approved" → now can login
```

### Approve Doctor
```
PUT /api/admin/doctors/{id}/approve
```
**Response:** Doctor status changed to "approved"
```json
{
  "message": "Doctor approved successfully",
  "doctor": { ... }
}
```

### Reject Doctor
```
PUT /api/admin/doctors/{id}/reject
Body: { "reason": "License verification failed" }
```
**Response:** Doctor status changed to "rejected" (cannot login)

### Block Doctor
```
PUT /api/admin/doctors/{id}/block
Body: { "reason": "Suspicious activity detected" }
```
**Response:** Doctor status changed to "blocked" (account disabled)

---

## 2. STAFF MANAGEMENT

### Create Staff Account (Admin Only)
```
POST /api/admin/staff
Body: {
  "name": "Staff Name",
  "email": "staff@emar.com",
  "password": "password@123",
  "hospital": "Hospital Name"
}
```
**Response:** Staff account created with auto-generated staffId
```json
{
  "message": "Staff created successfully",
  "staff": {
    "_id": "...",
    "name": "Staff Name",
    "staffId": "STAFF_1712234567891",
    "email": "staff@emar.com",
    "status": "active"
  }
}
```

### List All Staff
```
GET /api/admin/staff
```
**Returns:**
```json
{
  "staff": [...],
  "stats": {
    "total": 5,
    "active": 4,
    "blocked": 1
  }
}
```

### Block Staff
```
PUT /api/admin/staff/{id}/block
Body: { "reason": "Misconduct" }
```
**Staff can no longer login after blocking**

---

## 3. PATIENT MANAGEMENT

### List All Patients
```
GET /api/admin/patients
```
**Returns:** All patients with stats
```json
{
  "patients": [...],
  "stats": {
    "total": 50,
    "active": 48,
    "blocked": 2
  }
}
```

### Block Patient (Optional Control)
```
PUT /api/admin/patients/{id}/block
Body: { "reason": "Fraudulent record" }
```
**Patient account disabled, cannot login**

---

## 4. MEDICAL RECORDS MANAGEMENT

### List All Records
```
GET /api/admin/records
GET /api/admin/records?status=pending
```
**Query Parameters:**
- `status`: draft | pending | approved | rejected

**Returns:**
```json
{
  "records": [...],
  "stats": {
    "total": 100,
    "draft": 10,
    "pending": 20,
    "approved": 60,
    "rejected": 10,
    "frozen": 5,
    "flagged": 3
  }
}
```

### Freeze Medical Record
```
PUT /api/admin/records/{id}/freeze
Body: { "reason": "Suspicious content" }
```
**Record locked - cannot be modified. Sets:**
- `isFrozen: true`
- `flagReason: "..."` (reason provided)

**Returns:**
```json
{
  "message": "Record frozen successfully",
  "record": { "isFrozen": true, ... }
}
```

### Unfreeze Medical Record
```
PUT /api/admin/records/{id}/unfreeze
```
**Record unlocked - can be edited again**

---

## 5. AUDIT LOGS & MONITORING

### Get All Access Logs
```
GET /api/admin/logs
```
**Returns:** Sorted by latest timestamp
```json
{
  "logs": [
    {
      "_id": "...",
      "patientId": "PAT001",
      "doctorName": "Dr. Name",
      "accessType": "view",
      "timestamp": "2024-04-05T10:30:00Z"
    }
  ],
  "total": 1000,
  "latestLog": {...}
}
```

---

## 6. SECURITY & SUSPICIOUS ACTIVITY

### Detect Suspicious Activity
```
POST /api/admin/security/detect-suspicious
```
**Auto-detects and flags:**
- Records with multiple rejections
- Frozen records not yet flagged
- Unusual access patterns

**Returns:**
```json
{
  "message": "Suspicious activity detection complete",
  "flaggedCount": 5,
  "flaggedRecords": ["id1", "id2", ...]
}
```

### Get Suspicious Records
```
GET /api/admin/security/suspicious-records
```
**Returns:** All records with `isFlagged: true`
```json
{
  "count": 5,
  "records": [
    {
      "_id": "...",
      "isFlagged": true,
      "flagReason": "SUSPICIOUS_ACTIVITY: Multiple rejection pattern"
    }
  ]
}
```

---

## 7. DASHBOARD STATISTICS

### Get Dashboard Overview
```
GET /api/admin/dashboard/stats
```
**Complete system overview:**
```json
{
  "doctors": {
    "total": 25,
    "approved": 20,
    "pending": 3,
    "rejected": 1,
    "blocked": 1
  },
  "staff": 15,
  "patients": 500,
  "records": {
    "total": 1200,
    "approved": 1000,
    "flagged": 8,
    "frozen": 5
  },
  "recentLogs": [...]
}
```

---

## 📋 Database Schema Changes

### Doctor Model
```javascript
{
  ...existing fields,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked'],
    default: 'pending'
  }
}
```

### Staff Model
```javascript
{
  ...existing fields,
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  }
}
```

### Patient Model
```javascript
{
  ...existing fields,
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  }
}
```

### MedicalRecord Model
```javascript
{
  ...existing fields,
  isFrozen: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String
    // e.g., "SUSPICIOUS_ACTIVITY: ..."
  }
}
```

---

## 🧪 Testing

### Run Setup Script
```bash
cd backend
node setupAdminTest.js
```

This creates:
- Pending doctor (for approval testing)
- Test staff account
- Test medical record (for freeze testing)

### Test Doctor Approval Workflow
1. Login as admin: `admin@emar.com` / `admin@123`
2. List doctors: `GET /api/admin/doctors`
3. Approve pending doctor: `PUT /api/admin/doctors/{id}/approve`
4. Now that doctor can login with their credentials

### Test Record Freezing
1. Get records: `GET /api/admin/records`
2. Freeze record: `PUT /api/admin/records/{id}/freeze`
3. Check frozen status in record query

---

## 🔒 Security Features

### Role-Based Access Control
- All endpoints protected with `authMiddleware` (JWT validation)
- All endpoints require `allowAdmin` (role verification)
- Invalid tokens: 401 Unauthorized
- Non-admin users: 403 Forbidden

### Doctor Login Validation
- Doctor can login ONLY if `status === 'approved'`
- Pending/Rejected/Blocked doctors receive 403 error
- Error message includes current status

### Staff Creation
- Only admins can create staff accounts
- No public signup for staff
- Auto-generated staffId with timestamp

### Record Freezing
- Prevents accidental/malicious record modifications
- Tracks freeze reason in `flagReason` field
- Supports both freeze and unfreeze operations

---

## 📊 Admin Responsibilities

✅ **Must Do:**
- Review and approve/reject new doctor registrations
- Monitor flagged and frozen records
- Create staff accounts for hospitals
- Monitor access logs for suspicious activity
- Block users who violate policies

⚠️ **Warning Signs:**
- Doctor status never changes from pending
- Unusual number of record rejections
- Multiple access attempts from same IP
- Large batch record uploads

🔐 **Security Best Practices:**
- Change default admin password immediately
- Use strong unique hospital staff credentials
- Regularly review logs
- Flag suspicious records proactively
- Keep doctor approval decisions documented

---

## 🚀 Implementation Status

✅ **Completed:**
- Doctor approval workflow (pending → approved)
- Doctor status-based login restriction
- Staff creation (admin only)
- Record freeze/unfreeze mechanism
- Suspicious activity detection
- Complete audit logging
- Dashboard statistics

**Next Steps (Optional):**
- Email notifications for approvals
- Batch operations for bulk actions
- Advanced filtering/search in lists
- Activity timeline per user
- System health monitoring dashboard
