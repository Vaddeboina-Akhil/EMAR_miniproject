## Consent System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PATIENT (Frontend)                        │
├─────────────────────────────────────────────────────────────────┤
│  ConsentSettings         AccessControl        PatientDetails     │
│  Component              Component             Component          │
│  • Toggle settings      • View active        • View own info     │
│  • Save preferences     • Revoke access      • See access history│
└────────────┬──────────────────┬─────────────────────┬───────────┘
             │                  │                     │
             └──────────────────┴─────────────────────┘
                        ↓
            ┌──────────────────────────┐
            │   Frontend Services      │
            ├──────────────────────────┤
            │ patientService           │
            │ • getConsentSettings()   │  
            │ • updateConsent...()     │
            │ • getActiveConsents()    │
            │ • revokeAccess()         │
            └──────────┬───────────────┘
                       ↓
        ┌─────────────────────────────────┐
        │   API Endpoints                 │
        ├─────────────────────────────────┤
        │ POST   /api/consent/request     │
        │ PUT    /api/consent/:id/...     │
        │ POST   /api/consent/:id/revoke  │
        │ GET    /api/patient-consent/... │
        │ PUT    /api/patient-consent/... │
        │ GET    /api/doctors/patients/:id│ ← ENFORCES CONSENT
        └──────────┬──────────────────────┘
                   ↓
     ┌─────────────────────────────────────────┐
     │     BACKEND (Node.js/Express)           │
     ├─────────────────────────────────────────┤
     │                                         │
     │  consentController                      │
     │  • requestAccess()                      │
     │  • respondConsent()                     │
     │  • revokeAccess()                       │
     │  • updateConsentDetails()               │
     │                                         │
     │  doctorController                       │
     │  • getPatientDetails() ***ENFORCES***   │
     │    - Check consent validity             │
     │    - Filter data based on permissions   │
     │    - Return 403 if no consent           │
     │                                         │
     │  patientConsentController               │
     │  • getConsentSettings()                 │
     │  • updateConsentSettings()              │
     │  • getAccessHistory()                   │
     │                                         │
     │  consentUtil.js (Core Logic)            │
     │  • isConsentValid()                     │
     │  • getActiveConsent()                   │
     │  • filterPatientDataByConsent()         │
     │  • filterMedicalRecords()               │
     │                                         │
     └──────────┬──────────────────────────────┘
                ↓
     ┌─────────────────────────────────────────┐
     │        DATABASE (MongoDB)               │
     ├─────────────────────────────────────────┤
     │                                         │
     │  Patient Collection                     │
     │  ├─ consentSettings.basicInfo: bool     │
     │  ├─ consentSettings.prescriptions: bool │
     │  ├─ consentSettings.fullReports: bool   │
     │  └─ consentSettings.emergencyAccess     │
     │                                         │
     │  Consent Collection                     │
     │  ├─ status (approved/pending/rejected)  │
     │  ├─ consentDetails { basicInfo, ... }   │
     │  ├─ expiresAt (datetime or null)        │
     │  ├─ isExpired (bool)                    │
     │  ├─ revokedAt (datetime or null)        │
     │  └─ revokeReason (string)               │
     │                                         │
     │  AccessLog Collection                   │
     │  ├─ physician info                      │
     │  ├─ timestamp                           │
     │  ├─ restrictions applied                │
     │  └─ access type (viewed/approved/...)   │
     │                                         │
     └─────────────────────────────────────────┘
```

## Data Flow: Doctor Accesses Patient Data

```
Doctor Clicks "View Patient"
        ↓
  doctorController.getPatientDetails()
        ↓
  consentUtil.getActiveConsent()
    ├─ Query: { patientId, doctorId, status: 'approved', revokedAt: null }
    ├─ Check expiration
    └─ Return consent or null
        ↓
   ┌─ If consent exists:
   │  ├─ consentUtil.filterPatientDataByConsent()
   │  │  ├─ Check basicInfo → Hide name/age/blood group if false
   │  │  ├─ Check prescriptions → Set flag if false
   │  │  └─ Check fullReports → Set flag if false
   │  ├─ consentUtil.filterMedicalRecords()
   │  └─ Return: { patient: {...filtered...}, records: [...] }
   │
   └─ If no consent:
      └─ Return: HTTP 403 with restricted message
```

## Doctor Request → Patient Approval → Access Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DOCTOR REQUESTS ACCESS                                   │
├─────────────────────────────────────────────────────────────┤
│ POST /api/consent/request                                   │
│ {                                                            │
│   patientId, doctorId, reason,                              │
│   consentDetails: {                                          │
│     basicInfo: true,       ← Request what's needed           │
│     prescriptions: true,                                     │
│     fullReports: true                                        │
│   },                                                         │
│   daysLimit: 7             ← Optional time limit             │
│ }                                                            │
│                                                              │
│ Creates: Consent(status: 'pending', expiresAt: +7 days)    │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PATIENT REVIEWS REQUEST                                  │
├─────────────────────────────────────────────────────────────┤
│ GET /api/patient-consent/:patientId/pending                │
│                                                              │
│ Frontend shows:                                              │
│ • Doctor name & hospital                                    │
│ • Reason for access                                         │
│ • Requested permissions                                     │
│ • Duration (7 days)                                         │
│                                                              │
│ Patient can:                                                │
│ • ✓ Approve with requested settings                         │
│ • □ Modify some permissions before approving                │
│ • ✗ Reject completely                                       │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PATIENT APPROVES                                         │
├─────────────────────────────────────────────────────────────┤
│ PUT /api/consent/:consentId (or update-details endpoint)   │
│ {                                                            │
│   status: 'approved',                                       │
│   consentDetails: {                                          │
│     basicInfo: true,       ← Patient modified this          │
│     prescriptions: false,  ← Blocked prescriptions          │
│     fullReports: true                                       │
│   }                                                          │
│ }                                                            │
│                                                              │
│ Updates: Consent(status: 'approved', responseDate: now)    │
│ Creates: AccessLog(accessType: 'approved')                 │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DOCTOR ACCESSES PATIENT DATA                             │
├─────────────────────────────────────────────────────────────┤
│ GET /api/doctors/patients/:patientId                        │
│                                                              │
│ Returns:                                                     │
│ {                                                            │
│   patient: {                                                │
│     name: "John Doe",      ← Included (basicInfo: true)     │
│     age: 32,                                                 │
│     bloodGroup: "O+",                                       │
│     _prescriptionsRestricted: true  ← Flag set              │
│   },                                                         │
│   records: [                ← No prescriptions filtered     │
│     { type: 'Report', ... },                                │
│     { type: 'Test', ... }                                   │
│   ],                                                         │
│   _consent: {                                                │
│     hasAccess: true,                                        │
│     expiresAt: '2024-04-07',                                │
│     daysRemaining: 7                                        │
│   }                                                          │
│ }                                                            │
│                                                              │
│ Creates: AccessLog(restrictions: {...})                    │
└─────────────────────────────────────────────────────────────┘
```

## Patient Revocation Flow

```
Patient clicks "Revoke Access" on doctor
        ↓
POST /api/consent/:consentId/revoke
{
  reason: "Changed hospitals"
}
        ↓
Updates: Consent(
  status: 'revoked',
  revokedAt: now,
  revokeReason: "Changed hospitals"
)
        ↓
Creates: AccessLog(accessType: 'revoked')
        ↓
Next doctor access attempt → DENIED (403)
```

## Permission Restrictions Applied

```
┌─────────────────────────────────────────────────────────────┐
│ Field/Permission          │ When DENIED (false)              │
├─────────────────────────────────────────────────────────────┤
│ basicInfo                 │ name → "[RESTRICTED]"            │
│ (basic personal info)     │ age → null                       │
│                           │ bloodGroup → "[RESTRICTED]"      │
│                           │ aadhaarId → "[RESTRICTED]"       │
│                           │ phone → "[RESTRICTED]"           │
│                           │                                  │
│ prescriptions             │ Prescription records filtered out │
│ (medicine details)        │ medicines field hidden on records │
│                           │                                  │
│ fullReports               │ Medical records list is empty    │
│ (medical data)            │ All records inaccessible         │
│                           │                                  │
│ emergencyAccess           │ Emergency override blocked       │
│ (emergency override)      │ (unless: emergencyAccess: true)  │
└─────────────────────────────────────────────────────────────┘
```

## Consent Expiration Logic

```
Consent Created with expiresAt: +7 days
        ↓
Day 1-6: Normal access, daysRemaining: 7→1
        ↓
Day 7: Access still works (last day), daysRemaining: 1
        ↓
Day 8: 
  consentUtil.getActiveConsent()
  checks: expiresAt < current time
  sets: isExpired = true
  returns: null (consent is invalid)
        ↓
Doctor access returns: 403 Forbidden
```
