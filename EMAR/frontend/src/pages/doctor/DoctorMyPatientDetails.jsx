import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const DoctorMyPatientDetails = () => {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const doctor = getUser();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching approved patient details:', patientId);

      const response = await api.get(`/doctors/my-patient/${patientId}`);
      console.log('Patient response:', response);

      if (response?.patient && response?.records) {
        setPatient(response.patient);
        setRecords(Array.isArray(response.records) ? response.records : []);
      }
    } catch (err) {
      console.error('Failed to fetch patient details:', err);
      setError(err.message || 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DoctorLayout activePage="My Patients">
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>⏳</div>
          <div style={{ color: '#666' }}>Loading patient details...</div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout activePage="My Patients">
        <div style={{
          backgroundColor: '#FFEBEE',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #EF5350'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>❌</div>
          <div style={{ color: '#C62828', fontWeight: 'bold', marginBottom: '8px' }}>
            Error Loading Patient
          </div>
          <div style={{ color: '#D32F2F', marginBottom: '16px' }}>
            {error}
          </div>
          <button
            onClick={() => navigate('/doctor/patient-management')}
            style={{
              backgroundColor: '#EF5350',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Back to My Patients
          </button>
        </div>
      </DoctorLayout>
    );
  }

  if (!patient) {
    return (
      <DoctorLayout activePage="My Patients">
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>🚫</div>
          <div style={{ color: '#666' }}>Patient not found</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activePage="My Patients">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/doctor/patient-management')}
          style={{
            backgroundColor: 'transparent',
            color: '#2E7D32',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          ← Back to My Patients
        </button>

        {/* Patient Info Card */}
        <div style={{
          backgroundColor: '#1B5E20',
          borderRadius: '16px',
          padding: '28px',
          color: 'white',
          marginBottom: '24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#81C784',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            {patient.name?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {patient.name}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
              ID: {patient.patientId}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              ✅ Approved Access
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Patient Details</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}>
              {records.length} Record{records.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Records Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#333'
          }}>
            📋 Medical Records ({records.length})
          </div>

          {records.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <div>No medical records available</div>
            </div>
          ) : (
            <div>
              {records.map((record, index) => (
                <div
                  key={record._id}
                  style={{
                    borderBottom: index < records.length - 1 ? '1px solid #eee' : 'none',
                    paddingBottom: '16px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        {record.recordType || 'Medical Record'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '8px'
                      }}>
                        {record.diagnosis || record.description || 'No description'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginBottom: '4px'
                      }}>
                        📅 {new Date(record.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginBottom: '4px'
                      }}>
                        👨‍⚕️ Dr. {record.doctorName || 'Unknown'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: record.status === 'approved' ? '#E8F5E9' : '#FFF3E0',
                        color: record.status === 'approved' ? '#2E7D32' : '#E65100',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginTop: '8px'
                      }}>
                        ✓ {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      {record.fileUrl && (
                        <>
                          <button
                            onClick={() => window.open(record.fileUrl, '_blank')}
                            style={{
                              backgroundColor: '#2E7D32',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            👁️ View
                          </button>
                          <a
                            href={record.fileUrl}
                            download={`record-${record._id}.pdf`}
                            style={{
                              backgroundColor: '#1976D2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}
                          >
                            ⬇️ Download
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorMyPatientDetails;
