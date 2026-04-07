import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminStaff from './pages/admin/AdminStaff';
import AdminRecords from './pages/admin/AdminRecords';
import AdminLogs from './pages/admin/AdminLogs';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import PatientMedicalHistory from './pages/patient/MedicalHistory';
import PatientConsentPage from './pages/patient/ConsentPage';
import PatientRequestAccess from './pages/patient/RequestAccess';
import PatientAuditTrail from './pages/patient/AuditTrail';
import PatientPrescriptions from './pages/patient/Prescriptions';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorSearchPatient from './pages/doctor/PatientList';
import DoctorPatientDetails from './pages/doctor/PatientDetails';
import DoctorMyPatientDetails from './pages/doctor/DoctorMyPatientDetails';
import DoctorPatientProfiles from './pages/doctor/PatientProfiles';
import DoctorPendingApprovals from './pages/doctor/PendingApprovals';
import DoctorAddRecord from './pages/doctor/AddRecord';
import DoctorAccessRequests from './pages/doctor/AccessRequests';

// Staff
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/Dashboard';
import SearchPatient from './pages/staff/SearchPatient';
import StaffPatientView from './pages/staff/StaffPatientView';
import StaffUploadRecord from './pages/staff/UploadRecord';

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin — hidden portal */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/doctors" element={<AdminDoctors />} />
      <Route path="/admin/patients" element={<AdminPatients />} />
      <Route path="/admin/staff" element={<AdminStaff />} />
      <Route path="/admin/records" element={<AdminRecords />} />
      <Route path="/admin/logs" element={<AdminLogs />} />

      {/* Patient */}
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/patient/medical-records" element={<PatientMedicalHistory />} />
      <Route path="/patient/consent" element={<PatientConsentPage />} />
      <Route path="/patient/request-access" element={<PatientRequestAccess />} />
      <Route path="/patient/audit-trail" element={<PatientAuditTrail />} />
      <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />

      {/* Doctor */}
      <Route path="/doctor/overview" element={<DoctorDashboard />} />
      <Route path="/doctor/search" element={<DoctorSearchPatient />} />
      <Route path="/doctor/patient-management" element={<DoctorPatientProfiles />} />
      <Route path="/doctor/my-patient/:id" element={<DoctorMyPatientDetails />} />
      <Route path="/doctor/patient/:id" element={<DoctorPatientDetails />} />
      <Route path="/doctor/pending-approvals" element={<DoctorPendingApprovals />} />
      <Route path="/doctor/add-record" element={<DoctorAddRecord />} />
      <Route path="/doctor/access-requests" element={<DoctorAccessRequests />} />

      {/* Staff — hidden portal */}
      <Route path="/hospital-staff-portal" element={<StaffLogin />} />
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff/dashboard" element={<StaffDashboard />} />
      <Route path="/staff/search" element={<SearchPatient />} />
      <Route path="/staff/patient/:id" element={<StaffPatientView />} />
      <Route path="/staff/upload" element={<StaffUploadRecord />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;