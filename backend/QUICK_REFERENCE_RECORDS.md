# Quick Reference: View Patient Records Feature

## User Journey

```
┌─────────────────────────────────────────────────────────┐
│ 1. Doctor Dashboard                                     │
│    • Sidebar: "Access Requests" link                    │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. /doctor/access-requests                              │
│    • List of all sent consent requests                  │
│    • Filter: All | Pending | Approved | Rejected       │
│                                                          │
│    For each APPROVED request:                           │
│    ├─ Patient Name                                      │
│    ├─ EMAR ID                                           │
│    ├─ Hospital                                          │
│    ├─ Response Date                                     │
│    └─ 📋 [View Patient Records] ← NEW BUTTON            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Click "View Patient Records"
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. /doctor/patient/:patientId/records                   │
│    • [← Back] button                                    │
│                                                          │
│    PATIENT INFO CARD:                                   │
│    ├─ Name: John Doe (or 🔒 Restricted)                 │
│    ├─ Age: 32 (or 🔒 Restricted)                        │
│    ├─ Blood: O+ (or 🔒 Restricted)                      │
│    └─ ✅ You have access • Expires: 7 Apr 24            │
│                                                          │
│    WARNINGS (if ≤3 days):                               │
│    └─ ⏰ Access expires in 3 days                        │
│                                                          │
│    RECORDS LIST:                                        │
│    ┌─ Record 1: Prescription                            │
│    │  By Dr. Smith • 20 Mar 24 | APPROVED               │
│    │  Diagnosis: Hypertension                           │
│    │  Medicines: Lisinopril 10mg                        │
│    │  [👁️ View PDF] [⬇️ Download]                        │
│    │                                                     │
│    ├─ Record 2: Test Report                             │
│    │  By Dr. Johnson • 18 Mar 24 | APPROVED             │
│    │  Description: Blood work results                   │
│    │  [👁️ View PDF] [⬇️ Download]                        │
│    │                                                     │
│    └─ Record 3: Medical Report                          │
│       By Dr. Smith • 15 Mar 24 | APPROVED               │
│       [No PDF available]                                │
└────────────────────┬────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            ↓                 ↓
      [Click View PDF]   [Click Download]
            │                 │
            ↓                 ↓
    ┌──────────────┐  ┌─────────────────┐
    │ PDF Modal    │  │ Download to     │
    │ Opens        │  │ Computer        │
    │              │  │ (auto-filename) │
    │ [Scroll]     │  │                 │
    │ [Download]   │  │ ✅ File saved   │
    │ [Close]      │  └─────────────────┘
    └──────────────┘
```

## Component Hierarchy

```
DoctorLayout (wrapper)
└─ DoctorPatientRecords (NEW)
   ├─ Header Section
   │  ├─ Back Button (→ /doctor/access-requests)
   │  ├─ Title & Patient Info
   │  └─ Record Count Badge
   │
   ├─ Consent Status Card
   │  ├─ Patient Info (filtered)
   │  ├─ Consent Expiration
   │  └─ Permission Status
   │
   ├─ Expiration Warning (if ≤3 days)
   │  └─ Days Remaining & Message
   │
   ├─ Records List
   │  └─ For each record:
   │     ├─ Record Type & Icon
   │     ├─ Doctor Name & Date
   │     ├─ Status Badge
   │     ├─ Record Details
   │     └─ Action Buttons (View/Download)
   │
   └─ PDF Viewer Modal (if open)
      ├─ Header (title + close)
      ├─ PDF iframe
      └─ Footer (download + close)
```

## State Management

```
useState Variables:
├─ patient: { name, age, bloodGroup, ... }
├─ records: []
├─ loading: boolean
├─ error: { type, title, message, details }
├─ consentInfo: { hasAccess, expiresAt, daysRemaining }
├─ selectedRecord: { recordType, fileUrl, ... }
└─ viewingPdf: boolean
```

## Data Flow

```
Component Mount
    ↓
fetchPatientRecords()
    ├─ GET /api/doctors/patients/:patientId
    └─ Response includes:
       ├─ patient (filtered)
       ├─ records (filtered)
       └─ _consent (expiration info)
    ↓
Display Page
    ├─ If error → Show error UI
    ├─ If expired → Show 403 error
    ├─ If no consent → Show access denied
    └─ If valid → Show records
    ↓
User Actions
    ├─ View PDF → handleViewPdf()
    ├─ Download → handleDownloadPdf()
    └─ Back → navigate('/doctor/access-requests')
```

## Error States

| Error | HTTP | UI Message | Action |
|-------|------|-----------|--------|
| No Consent | 403 | 🔐 Access Denied | Back Button |
| Expired | 403 | 🔐 Access Denied | Back Button |
| Revoked | 403 | 🔐 Access Denied | Back Button |
| Not Found | 404 | ❌ Patient Not Found | Back Home |
| Server Error | 500 | ⚠️ Error | Retry |

## Consent Filtering Examples

### Example 1: Full Access
```
Request: basicInfo=true, prescriptions=true, fullReports=true
Result:
├─ Name: "John Doe" ✓
├─ Age: 32 ✓
├─ Blood: O+ ✓
├─ Records: All visible ✓
└─ Prescriptions: Visible ✓
```

### Example 2: No Basic Info
```
Request: basicInfo=false, prescriptions=true, fullReports=true
Result:
├─ Name: "🔒 Restricted" ✗
├─ Age: "—" ✗
├─ Blood: "🔒 Restricted" ✗
├─ Records: All visible ✓
└─ Prescriptions: Visible ✓
```

### Example 3: No Prescriptions
```
Request: basicInfo=true, prescriptions=false, fullReports=true
Result:
├─ Name: "John Doe" ✓
├─ Age: 32 ✓
├─ Blood: O+ ✓
├─ Records: Prescriptions filtered out ✓
└─ Prescriptions: [REMOVED] ✗
```

### Example 4: Restricted Reports
```
Request: basicInfo=true, prescriptions=true, fullReports=false
Result:
├─ Name: "John Doe" ✓
├─ Age: 32 ✓
├─ Blood: O+ ✓
├─ Records: [EMPTY] ✗
└─ Message: "Full reports not accessible" ✗
```

## API Integration

### Request
```
GET /api/doctors/patients/{patientId}
Authorization: Bearer {token}
```

### Successful Response (200)
```json
{
  "patient": {
    "_id": "ObjectId",
    "name": "John Doe",
    "age": 32,
    "bloodGroup": "O+",
    "patientId": "EMAR123",
    "_restricted": false,
    "_prescriptionsRestricted": false,
    "_reportsRestricted": false
  },
  "records": [
    {
      "_id": "ObjectId",
      "recordType": "Prescription",
      "diagnosis": "Hypertension",
      "medicines": "Lisinopril 10mg",
      "doctorName": "Dr. Smith",
      "visitDate": "2024-03-20",
      "status": "approved",
      "fileUrl": "data:application/pdf;base64,JVBERi0x..."
    }
  ],
  "_consent": {
    "hasAccess": true,
    "expiresAt": "2024-04-07T00:00:00Z",
    "daysRemaining": 7
  }
}
```

### Error Response (403)
```json
{
  "status": "restricted",
  "message": "Access denied. No valid consent found.",
  "patient": {
    "patientId": "EMAR123",
    "name": "[RESTRICTED]"
  }
}
```

## Keyboard Shortcuts (Future)

| Key | Action |
|-----|--------|
| Esc | Close PDF modal |
| Ctrl+S | Download PDF (in modal) |
| Ctrl+P | Print PDF (in modal) |
| /   | Search records (future) |

## Accessibility Features

- Color blind friendly status indicators
- High contrast error messages
- Back buttons for easy navigation
- Clear "Restricted" labels
- Status badges with text + color
- Proper heading hierarchy

## Performance Tips

- Records lazy load on mount only
- PDF only loads when modal opens
- Large lists scroll without blocking
- Minimal re-renders with useState
- No unnecessary API calls
- File download in background

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDF blank | Check if base64 is valid |
| Can't download | Check browser permissions |
| Slow loading | Check network speed |
| 403 error | Consent may be expired |
| Missing fields | Check consent settings |

---

**Component**: DoctorPatientRecords  
**Route**: `/doctor/patient/:patientId/records`  
**Feature Released**: March 31, 2026  
**Status**: ✅ Complete
