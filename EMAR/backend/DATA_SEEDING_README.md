# Hospital & Doctor Data Seeding Setup

This guide explains how to seed your EMAR MongoDB database with realistic hospital and doctor data.

## Overview

The data seeding system includes:
- **20 realistic hospitals** across different Indian cities with varied types (government, private, NGO)
- **25+ verified doctors** assigned to different hospitals with various specializations
- **Automated mapping** of doctors to hospitals using hospital names
- **One-command import** to populate the entire database

## Files Included

```
backend/
├── data/
│   ├── hospitals.json      # Hospital data (20 entries)
│   └── doctors.json        # Doctor data (25+ entries)
├── importData.js           # Main import script
└── package.json            # Updated with import script
```

## Prerequisites

1. MongoDB running locally or connection string in `.env`
2. All npm dependencies installed
3. Working Express.js backend

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure MongoDB Connection

Make sure your `.env` file has MongoDB URI:

```env
MONGODB_URI=mongodb://localhost:27017/emar
```

Or it will use the default local MongoDB connection.

### Step 3: Run the Import Script

```bash
npm run import
```

### Output

The script will display:

```
✅ MongoDB connected
🗑️  Clearing existing data...
✅ Existing data cleared
📥 Importing 20 hospitals...
✅ 20 hospitals imported successfully
📥 Importing 25+ doctors...
✅ 20 doctors imported successfully

✨ Data import completed successfully!

📊 Summary:
   - Hospitals: 20
   - Doctors: 25+
```

## Data Structure

### Hospitals

Each hospital includes:
- `name` - Hospital name (unique)
- `hospitalId` - Auto-generated unique ID (HOSP0001, HOSP0002, etc.)
- `city` - City name
- `state` - State name
- `type` - Type: "government", "private", or "ngo"
- `beds` - Number of beds
- `phone` - Contact phone
- `email` - Contact email
- `website` - Hospital website
- `address` - Full address
- `specialties` - Array of available specializations

### Doctors

Each doctor includes:
- `name` - Doctor name
- `doctorId` - Auto-generated unique ID (DOC00001, DOC00002, etc.)
- `licenseId` - Medical license ID (unique)
- `specialization` - Medical specialization
- `hospitalName` - Associated hospital name (auto-mapped to hospitalId)
- `hospitalId` - MongoDB reference to Hospital document (auto-populated)
- `email` - Doctor email (unique)
- `phone` - Contact phone
- `dob` - Date of birth
- `age` - Age
- `verified` - Verification status (true by default)
- `password` - Hashed password (dummy for seeding)
- `role` - User role (default: "doctor")

## Database Schema Details

### Hospital Model

```javascript
{
  name: String (unique),
  address: {
    street, city, state, pincode, coordinates
  },
  hospitalId: String (unique),
  specialties: [String],
  rating: { average, count },
  doctors: [ObjectId refs],
  staff: [ObjectId refs],
  verified: Boolean,
  timestamps
}
```

### Doctor Model (Updated)

```javascript
{
  name: String,
  dob: String,
  age: Number,
  licenseId: String (unique),
  specialization: String,
  hospitalName: String,
  hospitalId: ObjectId (ref: Hospital),     // NEW
  email: String (unique),
  phone: String,
  profileImage: String,
  password: String,
  doctorId: String,
  role: String,
  verified: Boolean,
  createdAt: Date
}
```

## Data Validation

The import script:
- ✅ Validates JSON file format
- ✅ Auto-generates unique IDs
- ✅ Maps doctors to hospitals by name
- ✅ Warns if hospital not found for a doctor
- ✅ Clears previous data before inserting
- ✅ Shows detailed progress logs

## Hospitals in Database

1. Apollo Hospitals Chennai
2. Fortis Hospital Delhi
3. Government Medical College Hospital (Bangalore)
4. Max Healthcare Delhi
5. Lilavati Hospital Mumbai
6. Jaslok Hospital Mumbai
7. AIIMS (New Delhi)
8. Christian Medical College Vellore
9. King Edward Memorial Hospital (Mumbai)
10. Rajendra Institute of Medical Sciences (Indore)
11. Artemis Hospital Gurugram
12. PD Hinduja National Hospital (Mumbai)
13. Sir Ganga Ram Hospital (Delhi)
14. Manipal Hospital Bangalore
15. St. John's Medical College Hospital (Bangalore)
16. Rajiv Gandhi Government Hospital (Chennai)
17. Narayana Health Bangalore
18. Vivekananda Medical Mission Hospital (Kolkata)
19. Institute of Medical Sciences (Delhi)
20. Global Hospital Chennai

## Doctor Specializations in Database

- Cardiology
- Oncology
- Orthopedics
- Neurology
- General Surgery
- Pediatrics
- Obstetrics
- Gastroenterology
- Nephrology
- Urology
- General Medicine
- Emergency Medicine
- And more...

## Querying After Import

### Get all hospitals
```javascript
const hospitals = await Hospital.find();
```

### Get doctors from a specific hospital
```javascript
const doctors = await Doctor.find({ hospitalName: "Apollo Hospitals Chennai" });
```

### Get doctors by specialization
```javascript
const cardiologists = await Doctor.find({ specialization: "Cardiology" });
```

### Get populated doctor with hospital data
```javascript
const doctor = await Doctor.findById(doctorId).populate('hospitalId');
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- Verify connection string format

### File Not Found Error
- Ensure JSON files are in `backend/data/` directory
- Check file names are exactly: `hospitals.json` and `doctors.json`

### Duplicate Key Error
- Clear database first: manually delete collections in MongoDB
- Or modify importData.js to skip duplicate check

## Manual Data Modification

To add more hospitals or doctors:

1. Edit `backend/data/hospitals.json` or `backend/data/doctors.json`
2. Ensure `hospitalName` in doctors matches hospital `name` exactly
3. Run `npm run import` again

## Notes

- Import will clear existing data before inserting (safe for development)
- All imported doctors are marked as `verified: true`
- Passwords are placeholder hashes (change before production use)
- Hospital and Doctor IDs are auto-generated, so each import creates new IDs
- Perfect for development, testing, and demos!

---

**Created:** March 2026  
**Last Updated:** March 29, 2026
