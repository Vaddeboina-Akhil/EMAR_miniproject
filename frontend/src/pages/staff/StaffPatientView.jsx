import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { recordService, authService } from '../../services/apiService';
import { getUser } from '../../utils/auth';

const StaffPatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const staff = getUser();
  
  // Patient data
  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  
  // Upload form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    recordType: 'Prescription',
    diagnosis: '',
    medicines: '',
    notes: '',
  });

  useEffect(() => {
    if (!id) {
      navigate('/staff/dashboard');
      return;
    }
    fetchPatientData();
  }, [id, navigate]);

  const fetchPatientData = async () => {
    try {
      setPatientLoading(true);
      const patientData = await api.get(`/patients/${id}`);
      setPatient(patientData);
      
      // Reset form with hospital info
      setFormData(prev => ({
        ...prev,
        diagnosis: '',
        medicines: '',
        notes: ''
      }));
    } catch (err) {
      console.error('Failed to fetch patient:', err);
      alert('❌ Patient not found');
      navigate('/staff/dashboard');
    } finally {
      setPatientLoading(false);
    }
  };

  const handleUploadRecord = async (e) => {
    e.preventDefault();
    
    if (!formData.diagnosis.trim()) {
      alert('⚠️ Please enter diagnosis');
      return;
    }

    setUploading(true);
    try {
      const staffId = staff?._id || staff?.id;
      const recordData = {
        patientId: patient._id || patient.patientId,
        patientName: patient.name,
        recordType: formData.recordType,
        diagnosis: formData.diagnosis,
        medicines: formData.medicines || '',
        notes: formData.notes || '',
        staffId,
        staffName: staff?.name || 'Unknown',
        hospitalName: staff?.hospitalName || 'General Hospital'
      };

      const result = await recordService.createDraft(recordData);
      
      alert('✅ Record saved as draft!');
      setFormData({
        recordType: 'Prescription',
        diagnosis: '',
        medicines: '',
        notes: '',
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

  const handleLogout = () => {
    authService.logout();
    navigate('/');
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
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#F8F9FA'
    }}>
      {/* Navbar */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '4px solid #DC143C',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => navigate('/staff/dashboard')}
            style={{
              backgroundColor: 'transparent',
              color: '#DC143C',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC143C', letterSpacing: '2px' }}>
              EMAR
            </div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
              Patient Profile
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#DC143C',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '10px 28px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(220, 20, 60, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(220, 20, 60, 0.4)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(220, 20, 60, 0.3)'}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Patient Header Card */}
        <div style={{
          backgroundColor: '#DC143C',
          borderRadius: '20px',
          padding: '32px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '32px',
          boxShadow: '0 4px 16px rgba(220, 20, 60, 0.2)'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            flexShrink: 0
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {patient.name || 'Patient'}
            </div>
            <div style={{ fontSize: '15px', marginBottom: '6px', opacity: 0.9 }}>
              Patient ID: <strong>{patient.patientId}</strong>
            </div>
            {patient.aadhaarId && (
              <div style={{ fontSize: '15px', marginBottom: '6px', opacity: 0.9 }}>
                Aadhaar: <strong>{patient.aadhaarId}</strong>
              </div>
            )}
            {patient.age && (
              <div style={{ fontSize: '15px', opacity: 0.9 }}>
                Age: <strong>{patient.age}</strong>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              backgroundColor: showUploadForm ? '#B71C1C' : 'white',
              color: '#DC143C',
              borderRadius: '50px',
              padding: '12px 32px',
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
            
            {/* Auto-filled patient info (read-only display) */}
            <div style={{
              backgroundColor: '#F8F8F8',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #E0E0E0'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Patient Name</div>
                  <div style={{ color: '#333', fontWeight: 'bold', padding: '8px' }}>{patient.name}</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px', fontWeight: '600' }}>Patient ID</div>
                  <div style={{ color: '#333', fontWeight: 'bold', padding: '8px' }}>{patient.patientId}</div>
                </div>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUploadRecord} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Record Type */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  Record Type
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

              {/* Diagnosis */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  Diagnosis *
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Medical diagnosis and findings"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>

              {/* Medicines */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  Medicines & Dosage
                </label>
                <textarea
                  value={formData.medicines}
                  onChange={(e) => setFormData({ ...formData, medicines: e.target.value })}
                  placeholder="Medications and dosage instructions"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#333' }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes or observations"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                  onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    flex: 1,
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading) e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    if (!uploading) e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {uploading ? '⏳ Saving...' : '💾 Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#DDD',
                    color: '#333',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#CCC'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#DDD'}
                >
                  Cancel
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

          {patient.allergies && patient.allergies.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
                Allergies
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} style={{
                    backgroundColor: '#FFCDD2',
                    color: '#DC143C',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {patient.chronicConditions && patient.chronicConditions.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
                Chronic Conditions
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {patient.chronicConditions.map((condition, idx) => (
                  <span key={idx} style={{
                    backgroundColor: '#FFE0B2',
                    color: '#E65100',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {condition}
                  </span>
                ))}
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
