# View Patient Records Feature - Testing Guide

## Feature Overview
Allows doctors to securely view and download patient medical records after receiving consent approval.

## User Flow

### 1. Access Requests Page
- Path: `/doctor/access-requests`
- Shows all consent requests sent by the doctor
- For **APPROVED** requests only: Shows new button "📋 View Patient Records"

### 2. Clicking "View Patient Records"
- Navigation: `/doctor/patient/:patientId/records`
- Validates that consent is still active and not expired
- Verifies access has not been revoked

### 3. Patient Records Page
Displays:
- **Patient Info Card**: Name, Age, Blood Group (with consent filtering)
- **Consent Status**: Shows expiration date and remaining days
- **⏰ Expiration Warning**: If access expires in ≤ 3 days
- **Records List**: Each record shows:
  - Record Type (Prescription, Test, Report, etc.)
  - Doctor Name
  - Date
  - Status (Draft, Pending, Approved)
  - Actions: View PDF, Download PDF

### 4. PDF Viewing
- Click "👁️ View PDF" to open modal
- Embedded PDF viewer with scroll
- Download button in modal footer
- "Close" button to exit

### 5. PDF Download
- Click "⬇️ Download" on record card or in modal
- Downloads base64 PDF to computer
- Auto-generated filename: `{RecordType}_{RecordID}.pdf`

## Error Handling

### No Consent
```
HTTP 403 - Access Denied
- Shows: "🔐 Access Denied" message
- Explains: "You do not have access to this patient's records"
- Action: Button to go back to Access Requests
```

### Consent Expired
```
Same as No Consent (expires consent is treated as invalid)
```

### Patient Not Found
```
HTTP 404 - Patient Not Found
- Shows: "❌ Patient Not Found" message
```

## Consent Filtering Applied

| Setting | Behavior |
|---------|----------|
| `basicInfo = false` | Name, Age, Blood Group show as `🔒 Restricted` |
| `prescriptions = false` | Prescription records filtered out |
| `fullReports = false` | Empty records list with message |
| `emergencyAccess = true` | All data accessible in emergencies |

## Access Logging

All record views are logged in `AccessLog` collection:
```javascript
{
  patientId: ObjectId,
  doctorName: String,
  doctorId: ObjectId,
  hospitalName: String,
  accessType: 'viewed',
  timestamp: Date,
  restrictions: {
    basicInfo: Boolean,
    prescriptions: Boolean,
    fullReports: Boolean
  }
}
```

## Testing Scenarios

### Scenario 1: Successful Access
1. Doctor A requests access to Patient X
2. Patient X approves with all consents
3. Doctor A clicks "View Patient Records"
4. Records page loads with all patient info and records
5. Doctor can view and download PDFs

### Scenario 2: Restricted Prescriptions
1. Doctor A requests access
2. Patient X approves but denies prescriptions
3. Doctor views records page
4. Prescription records are filtered out
5. Can still view other record types

### Scenario 3: Expired Consent
1. Doctor A has consent expiring in 1 day
2. Page shows: "Your access expires in 1 day"
3. After expiration date, accessing page shows 403
4. Must request new access

### Scenario 4: Revoked Access
1. Patient X revokes Doctor A's access
2. Doctor A tries to view records
3. Page shows: "Access Denied"
4. Must request new access (if patient allows)

### Scenario 5: Restricted Basic Info
1. Patient X denies basic info consent
2. Doctor views records
3. Name shows: `🔒 Restricted`
4. Age shows: `—`
5. Blood Group shows: `🔒 Restricted`

## Backend Endpoints Used

### Get Patient Records (with Consent Enforcement)
```
GET /api/doctors/patients/:patientId
Headers: Authorization: Bearer {token}

Response (Success - 200):
{
  patient: { /* filtered by consent */ },
  records: [ /* filtered by consent */ ],
  _consent: {
    hasAccess: true,
    expiresAt: "2024-04-07T00:00:00Z",
    daysRemaining: 7
  }
}

Response (No Consent - 403):
{
  status: 'restricted',
  message: 'Access denied. No valid consent found.',
  patient: { /* basic restricted data */ }
}
```

## Frontend Routes

- Access Requests: `/doctor/access-requests`
- Patient Records: `/doctor/patient/:patientId/records`

## Components

### AccessRequests.jsx (Updated)
- Added "View Patient Records" button for approved consents
- Passes consent info via `state` parameter

### PatientRecords.jsx (New)
- Validates consent on load
- Handles expired/revoked access gracefully
- Provides PDF viewing and downloading
- Shows expiration warnings
- Applies consent filtering

## Features Implemented

✅ Access requests page with view button
✅ Patient records page with authentication
✅ Consent validation on load
✅ Data filtering based on consent settings
✅ PDF viewing in modal
✅ PDF downloading
✅ Expiration warnings (≤3 days)
✅ Error handling (no access, expired, not found)
✅ Access logging with restrictions
✅ Responsive design
✅ Clean UI with status indicators

## Known Limitations

- PDF viewer requires base64 encoded PDFs in fileUrl
- Large PDFs may have performance issues
- Modal PDF viewer works best in modern browsers
- No print functionality (can use browser print within modal)

## Future Enhancements

- Add print capability
- Export records as batch ZIP
- Email records to patient
- Digital signature verification
- Record-specific access logs
- Search/filter records by type
- Sorting by date/doctor/type
