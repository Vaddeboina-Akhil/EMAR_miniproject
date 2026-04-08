import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const DoctorPatientRecords = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = getUser();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consentInfo, setConsentInfo] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewingPdf, setViewingPdf] = useState(false);

  useEffect(() => {
    fetchPatientRecords();
  }, [patientId]);

  const fetchPatientRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Call backend to get patient details with consent enforcement
      const response = await api.get(`/doctors/patients/${patientId}`);

      setPatient(response.data.patient);
      setRecords(Array.isArray(response.data.records) ? response.data.records : []);
      
      if (response.data._consent) {
        setConsentInfo(response.data._consent);
      }

      // Log that we accessed records
      console.log('✅ Patient records fetched with consent:', response.data._consent);
    } catch (err) {
      console.error('🔴 Error fetching patient records:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        config: err.config?.url
      });

      // ✅ Handle different error scenarios
      if (err.response?.status === 403) {
        setError({
          type: 'no_access',
          title: '🔒 Access Denied',
          message: err.response.data?.message || 'You do not have access to this patient\'s records',
          details: err.response.data?.message
        });
      } else if (err.response?.status === 404) {
        setError({
          type: 'not_found',
          title: '❌ Patient Not Found',
          message: 'The patient record could not be found'
        });
      } else {
        setError({
          type: 'error',
          title: '⚠️ Error',
          message: err.response?.data?.message || err.message || 'Failed to load patient records',
          fullError: JSON.stringify({
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          })
        });
      }

      setPatient(null);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle PDF viewing
  const handleViewPdf = (record) => {
    setSelectedRecord(record);
    setViewingPdf(true);
  };

  // ✅ Handle PDF download
  const handleDownloadPdf = (record) => {
    if (!record.fileUrl) {
      alert('PDF not available for download');
      return;
    }

    try {
      // Convert base64 to blob
      const byteCharacters = atob(record.fileUrl.split(',')[1] || record.fileUrl);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = record.fileName || `${record.recordType}_${record._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error downloading PDF');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getConsentDaysRemaining = () => {
    if (!consentInfo?.expiresAt) return null;
    return Math.ceil((new Date(consentInfo.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getConsentDaysRemaining();
  const isConsentExpiring = daysRemaining !== null && daysRemaining <= 3;

  // ✅ Error State
  if (!loading && error) {
    return (
      <DoctorLayout activePage="Patient Records">
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <div style={{
            backgroundColor: '#1A237E', borderRadius: '16px',
            padding: '28px', color: 'white', marginBottom: '24px'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>Patient Records</div>
          </div>

          <div style={{
            backgroundColor: error.type === 'no_access' ? '#FFEBEE' : '#FFF8E1',
            borderLeft: `4px solid ${error.type === 'no_access' ? '#E74C3C' : '#F39C12'}`,
            borderRadius: '12px', padding: '24px', textAlign: 'center'
          }}>
            <div style={{
              fontSize: '36px', marginBottom: '12px'
            }}>
              {error.type === 'no_access' ? '🔒' : error.type === 'not_found' ? '❌' : '⚠️'}
            </div>
            <div style={{
              fontSize: '22px', fontWeight: 'bold',
              color: error.type === 'no_access' ? '#C0392B' : '#D68910'
            }}>
              {error.title}
            </div>
            <div style={{
              fontSize: '14px', color: '#666', marginTop: '12px', maxWidth: '500px', margin: '12px auto 0'
            }}>
              {error.message}
            </div>

            {error.fullError && (
              <div style={{
                marginTop: '16px', backgroundColor: '#f5f5f5', padding: '12px', 
                borderRadius: '8px', fontSize: '12px', color: '#333', 
                textAlign: 'left', fontFamily: 'monospace', maxWidth: '600px', margin: '16px auto 0',
                overflow: 'auto'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Debug Info:</div>
                <div>{error.fullError}</div>
              </div>
            )}

            {error.type === 'no_access' && (
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={() => navigate('/doctor/access-requests')}
                  style={{
                    backgroundColor: '#1A237E', color: 'white',
                    border: 'none', borderRadius: '8px',
                    padding: '10px 20px', cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ← Back to Access Requests
                </button>
              </div>
            )}
          </div>
        </div>
      </DoctorLayout>
    );
  }

  // ✅ Loading State
  if (loading) {
    return (
      <DoctorLayout activePage="Patient Records">
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '24px', color: '#666' }}>Loading patient records...</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activePage="Patient Records">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: '#1A237E', borderRadius: '16px',
          padding: '28px', color: 'white', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <button
              onClick={() => navigate('/doctor/access-requests')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)', border: 'none',
                color: 'white', padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '14px', marginBottom: '12px'
              }}
            >
              ← Back
            </button>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              📋 Patient Records
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              {patient?.name || 'Patient'} • ID: {patient?.patientId || '—'}
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '12px', padding: '12px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900' }}>{records.length}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Records</div>
          </div>
        </div>

        {/* ✅ Consent Expiration Warning */}
        {consentInfo && isConsentExpiring && (
          <div style={{
            backgroundColor: '#FFF3CD', borderLeft: '4px solid #FFC107',
            borderRadius: '12px', padding: '16px', marginBottom: '24px'
          }}>
            <div style={{ fontSize: '14px', color: '#856404', fontWeight: 'bold' }}>
              ⏰ Consent Expiring Soon
            </div>
            <div style={{ fontSize: '13px', color: '#856404', marginTop: '4px' }}>
              Your access to this patient's records expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
              {daysRemaining === 1 && ' This is your last day to access these records.'}
            </div>
          </div>
        )}

        {/* Patient Info Card */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '6px' }}>
                Patient Name
              </div>
              <div style={{
                fontSize: '16px', fontWeight: 'bold', color: '#111',
              }}>
                {patient?._restricted ? '🔒 Restricted' : patient?.name || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '6px' }}>
                Age
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111' }}>
                {patient?._restricted ? '🔒 Restricted' : patient?.age || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '6px' }}>
                Blood Group
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111' }}>
                {patient?._restricted ? '🔒 Restricted' : patient?.bloodGroup || '—'}
              </div>
            </div>
          </div>

          {/* Consent Info */}
          <div style={{
            backgroundColor: '#E8F5E9', borderRadius: '12px',
            padding: '12px 16px', fontSize: '13px', color: '#2E7D32'
          }}>
            <strong>✅ You have access to these records</strong>
            {consentInfo?.expiresAt && (
              <span style={{ marginLeft: '12px' }}>
                · Expires: {new Date(consentInfo.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Records List */}
        {records.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              No Records Available
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
              {patient?._reportsRestricted ? 'Full reports are not accessible based on consent settings' : 'This patient has no medical records'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {records.map((record, idx) => (
              <div
                key={record._id || idx}
                style={{
                  backgroundColor: 'white', borderRadius: '16px',
                  padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1.5px solid #E0E0E0', transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = '#1A237E';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#E0E0E0';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A237E' }}>
                      📄 {record.recordType || 'Medical Record'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                      {record.doctorName && <span>By Dr. {record.doctorName}</span>}
                      {record.doctorName && record.visitDate && <span> • </span>}
                      {record.visitDate && <span>{formatDate(record.visitDate)}</span>}
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: record.status === 'approved' ? '#E8F5E9' : '#FFF3E0',
                    color: record.status === 'approved' ? '#2E7D32' : '#E65100',
                    borderRadius: '8px', padding: '6px 12px',
                    fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {record.status?.toUpperCase() || 'DRAFT'}
                  </span>
                </div>

                {/* Record Details */}
                <div style={{
                  backgroundColor: '#FAFAFA', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px'
                }}>
                  {record.diagnosis && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Diagnosis
                      </div>
                      <div style={{ fontSize: '14px', color: '#333' }}>
                        {record.diagnosis}
                      </div>
                    </div>
                  )}

                  {!patient?._prescriptionsRestricted && record.medicines && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Medicines
                      </div>
                      <div style={{ fontSize: '14px', color: '#333' }}>
                        {record.medicines}
                      </div>
                    </div>
                  )}

                  {record.description && (
                    <div>
                      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Notes
                      </div>
                      <div style={{ fontSize: '14px', color: '#555' }}>
                        {record.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {record.fileUrl && (
                    <>
                      <button
                        onClick={() => handleViewPdf(record)}
                        style={{
                          flex: 1, padding: '10px 16px',
                          backgroundColor: '#2196F3', color: 'white',
                          border: 'none', borderRadius: '8px',
                          cursor: 'pointer', fontWeight: 'bold',
                          fontSize: '13px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
                      >
                        👁️ View PDF
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(record)}
                        style={{
                          flex: 1, padding: '10px 16px',
                          backgroundColor: '#27AE60', color: 'white',
                          border: 'none', borderRadius: '8px',
                          cursor: 'pointer', fontWeight: 'bold',
                          fontSize: '13px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#27AE60'}
                      >
                        ⬇️ Download
                      </button>
                    </>
                  )}
                  {!record.fileUrl && (
                    <div style={{
                      flex: 1, padding: '10px 16px',
                      backgroundColor: '#F0F0F0', color: '#999',
                      borderRadius: '8px', textAlign: 'center',
                      fontSize: '13px'
                    }}>
                      No PDF available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ PDF Viewer Modal */}
        {viewingPdf && selectedRecord && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white', borderRadius: '16px',
              width: '90%', maxWidth: '900px', height: '90vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}>
              {/* Modal Header */}
              <div style={{
                borderBottom: '1px solid #E0E0E0', padding: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  📄 {selectedRecord.recordType}
                </div>
                <button
                  onClick={() => setViewingPdf(false)}
                  style={{
                    backgroundColor: 'white', border: '1px solid #E0E0E0',
                    borderRadius: '8px', padding: '8px 16px',
                    cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  ✕ Close
                </button>
              </div>

              {/* PDF Content */}
              <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
                {selectedRecord.fileUrl && (
                  <>
                    {/* ✅ Embedded PDF viewer */}
                    <iframe
                      src={selectedRecord.fileUrl}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title={selectedRecord.recordType}
                    />
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                borderTop: '1px solid #E0E0E0', padding: '16px',
                display: 'flex', gap: '12px', justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => handleDownloadPdf(selectedRecord)}
                  style={{
                    padding: '10px 20px', backgroundColor: '#27AE60',
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  ⬇️ Download
                </button>
                <button
                  onClick={() => setViewingPdf(false)}
                  style={{
                    padding: '10px 20px', backgroundColor: '#95A5A6',
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientRecords;
