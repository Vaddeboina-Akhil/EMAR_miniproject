import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import PatientDashboard from './pages/patient/Dashboard';
import PatientMedicalHistory from './pages/patient/MedicalHistory';
import PatientConsentPage from './pages/patient/ConsentPage';
import PatientRequestAccess from './pages/patient/RequestAccess';
import PatientAuditTrail from './pages/patient/AuditTrail';
import PatientPrescriptions from './pages/patient/Prescriptions';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatientList from './pages/doctor/PatientList';
import DoctorPatientProfiles from './pages/doctor/PatientProfiles';
import DoctorPatientDetails from './pages/doctor/PatientDetails';
import StaffLogin from './pages/staff/StaffLogin';
import SearchPatient from './pages/staff/SearchPatient';
import StaffPatientView from './pages/staff/StaffPatientView';
import StaffUploadRecord from './pages/staff/UploadRecord';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/medical-records" element={<PatientMedicalHistory />} />
      <Route path="/patient/consent" element={<PatientConsentPage />} />
      <Route path="/patient/request-access" element={<PatientRequestAccess />} />
      <Route path="/patient/audit-trail" element={<PatientAuditTrail />} />
      <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
      <Route path="/doctor/overview" element={<DoctorDashboard />} />
      <Route path="/doctor/patient-management" element={<DoctorPatientList />} />
      <Route path="/doctor/patient-profiles" element={<DoctorPatientProfiles />} />
      <Route path="/doctor/patient/:id" element={<DoctorPatientDetails />} />
      <Route path="/hospital-staff-portal" element={<StaffLogin />} />
      <Route path="/staff/search" element={<SearchPatient />} />
      <Route path="/staff/patient/:id" element={<StaffPatientView />} />
      <Route path="/staff/upload" element={<StaffUploadRecord />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;