import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { recordService, authService } from '../../services/apiService';
import { getUser } from '../../utils/auth';

const StaffPatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const staff = getUser();
  
  // Patient data
  const [patient, setPatient] = useState(location.state?.patient || null);
  const [patientLoading, setPatientLoading] = useState(!location.state?.patient);
  
  // Doctors data
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  
  // Upload form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    recordType: 'Prescription',
    doctorId: '',
    doctorName: '',
    diagnosis: '',
    pdfFile: null
  });

  useEffect(() => {
    if (!id) {
      navigate('/staff/dashboard');
      return;
    }
    
    // Always fetch from API to ensure fresh data
    fetchPatientData();
    fetchDoctors();
  }, [id, navigate]);

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const hospital = staff?.hospitalName || '';
      console.log(`📡 Fetching doctors from hospital: ${hospital}`);
      
      const response = await api.get('/doctors/all', {
        params: { hospital }
      });
      
      console.log('✅ Doctors:', response.doctors);
      setDoctors(response.doctors || []);
    } catch (err) {
      console.error('❌ Failed to fetch doctors:', err);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchPatientData = async () => {
    try {
      setPatientLoading(true);
      console.log('📡 Fetching patient with ID:', id);
      const response = await api.get(`/patient/profile/${id}`);
      console.log('📦 API Response:', response);
      
      const patientData = response.patient || response;
      console.log('✅ Patient Data:', patientData);
      setPatient(patientData);
      
      // Reset form with hospital info
      setFormData(prev => ({
        ...prev,
        diagnosis: '',
        medicines: '',
        notes: ''
      }));
    } catch (err) {
      console.error('❌ Failed to fetch patient:', err);
      console.error('Error details:', err.response || err.message);
      alert('❌ Patient not found: ' + (err.message || 'Unknown error'));
      navigate('/staff/dashboard');
    } finally {
      setPatientLoading(false);
    }
  };

  const handleUploadRecord = async (e) => {
    e.preventDefault();
    
    if (!formData.doctorId) {
      alert('⚠️ Please select a doctor');
      return;
    }

    if (!formData.diagnosis.trim()) {
      alert('⚠️ Please enter diagnosis');
      return;
    }

    if (!formData.pdfFile) {
      alert('⚠️ Please upload a PDF file');
      return;
    }

    if (formData.pdfFile.size > 10 * 1024 * 1024) {
      alert('⚠️ PDF file must be less than 10 MB');
      return;
    }

    setUploading(true);
    try {
      const staffId = staff?._id || staff?.id;
      const treatmentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get selected doctor info
      const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
      const doctorName = selectedDoctor?.name || 'Unknown';
      
      // Create FormData for file upload
      const formDataObj = new FormData();
      formDataObj.append('patientId', patient._id || patient.patientId);
      formDataObj.append('patientName', patient.name);
      formDataObj.append('recordType', formData.recordType);
      formDataObj.append('diagnosis', formData.diagnosis);
      formDataObj.append('doctorId', formData.doctorId);
      formDataObj.append('doctorName', doctorName);
      formDataObj.append('visitDate', treatmentDate);
      formDataObj.append('staffId', staffId);
      formDataObj.append('staffName', staff?.name || 'Unknown');
      formDataObj.append('hospitalName', staff?.hospitalName || 'General Hospital');
      formDataObj.append('pdfFile', formData.pdfFile);

      console.log('📤 Uploading record with PDF...');
      const result = await api.post('/records/upload', formDataObj);
      
      alert('✅ Record uploaded successfully!');
      setFormData({
        recordType: 'Prescription',
        doctorId: '',
        doctorName: '',
        diagnosis: '',
        pdfFile: null
      });
      setShowUploadForm(false);
      
      // Refresh patient data
      fetchPatientData();
    } catch (err) {
      console.error('Upload error:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Filter doctors based on search input
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  const handleDoctorSelect = (doctor) => {
    setFormData({
      ...formData,
      doctorId: doctor._id,
      doctorName: doctor.name
    });
    setSearchDoctor('');
    setShowDoctorDropdown(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/staff/login');
  };

  if (patientLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ fontSize: '16px', color: '#666' }}>⏳ Loading patient data...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>😕</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Patient not found</div>
        <button
          onClick={() => navigate('/staff/dashboard')}
          style={{
            backgroundColor: '#DC143C',
            color: 'white',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#FFFFFF'
    }}>
      {/* Navbar - EMAR logo on left, buttons on right */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '3px solid #DC143C',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#DC143C', letterSpacing: '1px' }}>
            EMAR
          </div>
          <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
            🏥 {staff?.hospitalName || 'Hospital'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/staff/dashboard')}
            style={{
              backgroundColor: 'transparent',
              color: '#DC143C',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#FFE6E6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ← Back
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#DC143C',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#B71C1C'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#DC143C'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Patient Header Card - Red background */}
        <div style={{
          backgroundColor: '#DC143C',
          borderRadius: '16px',
          padding: '28px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          marginBottom: '32px',
          boxShadow: '0 4px 16px rgba(220, 20, 60, 0.15)'
        }}>
          {/* Patient Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '56px',
            flexShrink: 0,
            overflow: 'hidden',
            border: '3px solid rgba(255, 255, 255, 0.5)'
          }}>
            {patient.profileImage ? (
              <img 
                src={patient.profileImage} 
                alt={patient.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              '👤'
            )}
          </div>

          {/* Patient Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px' }}>
              {patient.name || 'Patient'}
            </div>
            <div style={{ fontSize: '15px', marginBottom: '8px', opacity: 0.95 }}>
              Patient ID: <strong>{patient.patientId}</strong>
            </div>
            {patient.aadhaarId && (
              <div style={{ fontSize: '15px', marginBottom: '8px', opacity: 0.95 }}>
                Aadhaar: <strong>{patient.aadhaarId}</strong>
              </div>
            )}
            {patient.age && (
              <div style={{ fontSize: '15px', opacity: 0.95 }}>
                Age: <strong>{patient.age} years</strong>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              backgroundColor: 'white',
              color: '#DC143C',
              borderRadius: '8px',
              padding: '12px 28px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'}
            onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
          >
            {showUploadForm ? '✖ Cancel' : '📤 Upload Record'}
          </button>
        </div>

        {/* Upload Form Section */}
        {showUploadForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: '2px solid #DC143C'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#000' }}>
              📋 Add Medical Record
            </h2>

            {/* Upload Form */}
            <form onSubmit={handleUploadRecord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Record Type */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  Record Type
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                >
                  <option>Prescription</option>
                  <option>Lab Report</option>
                  <option>Scan</option>
                  <option>Surgery</option>
                  <option>Follow-Up</option>
                  <option>Vaccination</option>
                  <option>Checkup</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Doctor Selection - Searchable Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  Doctor *
                </label>
                <div style={{ position: 'relative' }}>
                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder={doctorsLoading ? '⏳ Loading doctors...' : 'Search doctor name or specialty...'}
                    value={formData.doctorId ? formData.doctorName : searchDoctor}
                    onChange={(e) => {
                      setSearchDoctor(e.target.value);
                      if (formData.doctorId) {
                        setFormData({ ...formData, doctorId: '', doctorName: '' });
                      }
                      setShowDoctorDropdown(true);
                    }}
                    onFocus={() => setShowDoctorDropdown(true)}
                    disabled={doctorsLoading}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      outline: 'none',
                      backgroundColor: doctorsLoading ? '#F5F5F5' : 'white',
                      cursor: doctorsLoading ? 'not-allowed' : 'text',
                      opacity: doctorsLoading ? 0.6 : 1
                    }}
                    onBlur={() => {
                      if (!formData.doctorId) {
                        setTimeout(() => setShowDoctorDropdown(false), 200);
                      }
                    }}
                  />

                  {/* Dropdown List */}
                  {showDoctorDropdown && !doctorsLoading && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '2px solid #DC143C',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      zIndex: 1000,
                      maxHeight: '250px',
                      overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor, idx) => (
                          <div
                            key={doctor._id}
                            onMouseDown={() => handleDoctorSelect(doctor)}
                            style={{
                              padding: '10px 12px',
                              backgroundColor: idx % 2 === 0 ? 'white' : '#F9F9F9',
                              borderBottom: idx < filteredDoctors.length - 1 ? '1px solid #F0F0F0' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              ':hover': {
                                backgroundColor: '#FFE6E6'
                              }
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE6E6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#F9F9F9'}
                          >
                            <div style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>
                              {doctor.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              {doctor.specialization}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{
                          padding: '16px 12px',
                          textAlign: 'center',
                          color: '#999',
                          fontSize: '13px'
                        }}>
                          {searchDoctor ? '❌ No doctors found' : '📋 No doctors available'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Doctor Display */}
                  {formData.doctorId && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      color: '#2E7D32',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ✅ {formData.doctorName} selected
                    </div>
                  )}
                </div>
              </div>

              {/* Short Diagnosis */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  Diagnosis *
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Brief diagnosis (2 lines max)"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    minHeight: '50px',
                    resize: 'none',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>

              {/* PDF File Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  📄 Upload PDF *
                </label>
                <div style={{
                  border: '2px dashed #DC143C',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  backgroundColor: '#FFF5F5',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFEBEE';
                    e.currentTarget.style.borderColor = '#B71C1C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFF5F5';
                    e.currentTarget.style.borderColor = '#DC143C';
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === 'application/pdf') {
                        setFormData({ ...formData, pdfFile: file });
                      } else {
                        alert('⚠️ Please select a PDF file');
                      }
                    }}
                    style={{ display: 'none' }}
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    {formData.pdfFile ? (
                      <>
                        <div style={{ fontSize: '18px', marginBottom: '6px' }}>✅</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#2E7D32' }}>
                          {formData.pdfFile.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '20px', marginBottom: '6px' }}>📁</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#DC143C' }}>
                          Click or drag PDF here
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          Max 10 MB
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    flex: 1,
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading) e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    if (!uploading) e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  {uploading ? '⏳ Saving...' : '💾 Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    color: '#333',
                    border: '2px solid #DC143C',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#FFE6E6';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Patient Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {patient.bloodGroup && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>
                Blood Group
              </div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#DC143C' }}>
                {patient.bloodGroup}
              </div>
            </div>
          )}

          {patient.allergies && patient.allergies.trim().length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
                Allergies
              </div>
              <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                {patient.allergies}
              </div>
            </div>
          )}

          {patient.guardianContact && patient.guardianContact.trim().length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
                Guardian Contact
              </div>
              <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                {patient.guardianContact}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div style={{
          backgroundColor: '#E3F2FD',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #2196F3',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#1565C0', marginBottom: '12px' }}>
            ℹ️ <strong>Workflow:</strong> All records are saved as drafts first and require doctor approval before patient can see them.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPatientView;
