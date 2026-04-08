# EMAR Consent System - Implementation Guide

## Overview
This document outlines the functional consent system implemented in the EMAR backend and frontend to enforce privacy and control access to patient medical data.

## System Architecture

### Backend Components

#### 1. **Patient Model** (`backend/src/models/Patient.js`)
Added consent settings that define default access permissions:
```javascript
consentSettings: {
  basicInfo: Boolean,       // name, age, blood group, contact
  prescriptions: Boolean,   // prescription details
  fullReports: Boolean,     // medical records
  emergencyAccess: Boolean  // emergency override flag
}
```

#### 2. **Consent Model** (`backend/src/models/Consent.js`)
Enhanced with time-limited and revocable access:
```javascript
consentDetails: {
  basicInfo, prescriptions, fullReports, emergencyAccess
},
expiresAt: Date,           // null = indefinite
isExpired: Boolean,        // quick lookup flag
revokedAt: Date,           // null = not revoked
revokeReason: String,
status: ['pending', 'approved', 'rejected', 'revoked']
```

#### 3. **Consent Utility** (`backend/src/utils/consentUtil.js`)
Core functions for consent validation and data filtering:
- `isConsentValid()` - Validates consent status and expiration
- `getActiveConsent()` - Retrieves current valid consent
- `filterPatientDataByConsent()` - Filters data based on consent
- `filterMedicalRecords()` - Filters records by type restrictions
- `checkAndFilterAccess()` - Complete access check and filter

#### 4. **Doctor Controller** (`backend/src/controllers/doctorController.js`)
**Modified `getPatientDetails()`:**
- Checks for active consent before returning data
- Filters patient information based on consent settings
- Filters medical records based on permissions
- Returns 403 if no valid consent exists
- Logs all access attempts

**Response Format with Consent:**
```javascript
{
  patient: { /* filtered data */ },
  records: [ /* filtered records */ ],
  _consent: {
    hasAccess: true,
    expiresAt: Date,
    daysRemaining: Number
  }
}
```

**Response Format without Consent:**
```javascript
// HTTP 403
{
  status: 'restricted',
  message: 'Access denied. No valid consent found.',
  patient: { /* basic info only */ }
}
```

#### 5. **Consent Controller** (`backend/src/controllers/consentController.js`)
New functions:
- `revokeAccess()` - Patient revokes doctor's access
- `updateConsentDetails()` - Modify specific permissions
- `getActiveConsentBetween()` - Check if consent exists

#### 6. **Patient Consent Controller** (`backend/src/controllers/patientConsentController.js`)
Patient-facing consent management:
- `getConsentSettings()` - Get default consent settings
- `updateConsentSettings()` - Update defaults
- `getActiveConsents()` - List active permissions
- `getPendingConsents()` - View pending requests
- `getAllConsents()` - View complete history
- `getAccessHistory()` - See who accessed data and when

### Database Access Logs
AccessLog records all access attempts with restriction details:
```javascript
{
  patientId, doctorId, doctorName,
  hospitalName, reason,
  accessType: ['viewed', 'approved', 'revoked'],
  restrictions: { basicInfo, prescriptions, fullReports }
}
```

---

## Frontend Components

### 1. **Consent Settings Component**
File: `frontend/src/components/features/ConsentSettings.jsx`

Allows patients to configure default consent settings:
- Toggle each permission level
- Save and persist settings
- Real-time feedback

### 2. **Access Control Component**
File: `frontend/src/components/features/AccessControl.jsx`

Tabs for managing doctor access:
- **Active Access**: Currently shared data
- **Pending**: Awaiting patient approval
- **History**: All past consents
- Revoke functionality with optional reason

### 3. **Patient Details with Consent**
File: `frontend/src/components/features/PatientDetailsWithConsent.jsx`

Doctor view showing:
- Restricted fields as `🔒 Restricted`
- Consent expiration countdown
- Access approval banner
- Filtered medical records

### 4. **Consent Utilities**
File: `frontend/src/utils/consentUtils.js`

Helper functions:
- `isRestricted()` - Check if field is restricted
- `displayValue()` - Format restricted/normal values
- `getRestrictionMessage()` - Build denial message
- `formatConsentExpiry()` - Human-readable expiration
- `hasValidConsent()` - Validate consent status

---

## API Endpoints

### Consent Management
```
POST   /api/consent/request
       Request access to patient data

GET    /api/consent/active/:patientId/:doctorId
       Check if valid consent exists

PUT    /api/consent/:consentId/update-details
       Update specific permission details

POST   /api/consent/:consentId/revoke
       Revoke access (by patient)

GET    /api/consent/doctor/:doctorId
       Doctor's pending requests
```

### Patient Consent Settings
```
GET    /api/patient-consent/:patientId/settings
       Get default consent settings

PUT    /api/patient-consent/:patientId/settings
       Update default consent settings

GET    /api/patient-consent/:patientId/active
       List active consents

GET    /api/patient-consent/:patientId/pending
       List pending requests

GET    /api/patient-consent/:patientId/all
       Get all consents grouped by status

GET    /api/patient-consent/:patientId/history
       View access history
```

### Doctor Endpoints
```
GET    /api/doctors/patients/:patientId
       Get patient details (ENFORCES CONSENT)
       Returns 403 if no valid consent
```

---

## Privacy Enforcement Rules

### Data Filtering Logic
Based on `consentDetails`:

| Setting | When FALSE | Effect |
|---------|-----------|--------|
| `basicInfo` | Hidden | Name → `[RESTRICTED]`, Age → `null`, Blood Group → `[RESTRICTED]` |
| `prescriptions` | Hidden | Prescription records filtered out |
| `fullReports` | Hidden | Medical records not accessible |
| `emergencyAccess` | - | Allows override in emergencies (requires separate flag) |

### Access Control Flow
```
Doctor requests patient details
    ↓
Check if consent exists (status='approved', not revoked)
    ↓
Check if consent expired
    ↓
If valid → Filter data based on consentDetails → Return filtered response
If invalid → Return HTTP 403 with restricted message
    ↓
Log access attempt with restrictions applied
```

---

## Usage Examples

### **Patient Scenario: Update Consent Settings**
```javascript
// Patient wants to hide their prescriptions
const consentSettings = {
  basicInfo: true,
  prescriptions: false,    // Hide prescriptions
  fullReports: true,
  emergencyAccess: false
};

await patientService.updateConsentSettings(patientId, consentSettings);
```

### **Doctor Scenario: Request Time-Limited Access**
```javascript
// Doctor needs patient data for 7 days
const consentDetails = {
  basicInfo: true,
  prescriptions: true,
  fullReports: true,
  emergencyAccess: false
};
const daysLimit = 7;

await doctorService.requestAccess(
  patientId, 
  doctorId, 
  'Post-surgery follow-up',
  consentDetails,
  daysLimit
);
```

### **Patient Scenario: Revoke Access**
```javascript
// Patient revokes doctor's access
await patientService.revokeAccess(
  consentId, 
  'Gone to different hospital'
);
```

### **Doctor Scenario: Fetch Patient Details**
```javascript
try {
  const response = await doctorService.getPatientDetails(patientId);
  // response.patient has filtered data
  // response._consent has expiration info
  console.log('Days remaining:', response._consent.daysRemaining);
} catch (error) {
  if (error.response.status === 403) {
    console.log('Access denied - need to request consent');
  }
}
```

---

## Database Indexing
For optimal performance:
```javascript
// Consent model indexes
consentSchema.index({ expiresAt: 1, isExpired: 1 });
consentSchema.index({ patientId: 1, status: 1 });
consentSchema.index({ doctorId: 1, status: 1 });
```

---

## Security Features

✅ **Consent Validation**: Every access checks validity  
✅ **Time-Limited Access**: Automatic expiration support  
✅ **Revocation**: Immediate access revocation  
✅ **Access Logging**: Complete audit trail  
✅ **Data Filtering**: Multiple restriction levels  
✅ **Emergency Override**: For critical scenarios  
✅ **Expired Consent Detection**: Auto-flagged and cached  

---

## Migration Notes

If upgrading existing patient records:
```javascript
// Set default consent settings for existing patients
db.patients.updateMany(
  {},
  {
    $set: {
      'consentSettings.basicInfo': true,
      'consentSettings.prescriptions': true,
      'consentSettings.fullReports': true,
      'consentSettings.emergencyAccess': false
    }
  }
);
```

---

## Testing Checklist

- [ ] Patient can update consent settings
- [ ] Doctor can request access with detailed permissions
- [ ] Patient can approve with time limit (e.g., 7 days)
- [ ] Doctor sees filtered data based on restrictions
- [ ] Patient can revoke access anytime
- [ ] Expired consents automatically deny access
- [ ] Access logs capture all interactions
- [ ] API returns 403 for no-consent scenarios
- [ ] Restricted fields show `[RESTRICTED]` in frontend
- [ ] Emergency access override works correctly

---

## Future Enhancements

1. **Granular Permissions**: Add record-type specific permissions
2. **Audit Reports**: Patient-accessible access logs  
3. **Notifications**: Alert patients when access is used
4. **Periodic Re-consent**: Require periodic consent renewal
5. **Read-Only Timestamps**: Track exactly when data was viewed
6. **IP Restrictions**: Limit access by location/IP
7. **Purpose-Based Access**: Different permissions for different purposes
8. **Delegation**: Allow patients to grant temporary access to family members

---

## Troubleshooting

**Q: Doctor sees "Access Denied" for a patient**
A: Check `/patient-consent/{patientId}/all` to see if consent exists and isn't expired/revoked

**Q: Consent expired but still showing as active**
A: Run cleanup: `Consent.updateMany({ expiresAt: { $lt: new Date() }, isExpired: false }, { isExpired: true })`

**Q: Patient fields still visible despite basicInfo=false**
A: Ensure doctor controller's `getPatientDetails` is using utility functions from consentUtil.js

**Q: Emergency access not working**
A: Verify `emergencyAccess: true` is set in consentDetails and passed to filterPatientDataByConsent

---

## Support
For issues or questions, refer to the implementation files or contact the development team.
