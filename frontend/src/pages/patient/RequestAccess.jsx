import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const PatientRequestAccess = () => {
  const navigate = useNavigate();
  const user = getUser();

  // 🔐 Validate that the logged-in user is actually a patient
  if (!user || user.role !== 'patient') {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '40px',
          textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Access Denied</h2>
          <p style={{ color: '#666', margin: '0 0 24px 0' }}>
            You must log in as a patient to access this page
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('emar_user');
              localStorage.removeItem('emar_token');
              navigate('/login');
            }}
            style={{
              backgroundColor: '#2ECC71', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 24px', fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  const handleNav = (page) => {
    const routes = {
      'Overview': '/patient/dashboard',
      'Medical Records': '/patient/medical-records',
      'Consent Settings': '/patient/consent',
      'Request Access': '/patient/request-access',
      'Audit Trail': '/patient/audit-trail',
      'Prescription': '/patient/prescriptions'
    };
    navigate(routes[page]);
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      const patientId = user?._id || user?.id;
      if (!patientId) return;
      const data = await api.get(`/consent/${patientId}`);
      setConsents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch consents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (consentId, status) => {
    setResponding(consentId);
    try {
      await api.put(`/consent/${consentId}`, { status });
      setConsents(prev => prev.map(c =>
        c._id === consentId
          ? { ...c, status, responseDate: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      alert('Failed to respond. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'numeric', day: 'numeric', year: 'numeric'
    });
  };

  const pendingConsents = consents.filter(c => c.status === 'pending');
  const resolvedConsents = consents.filter(c => c.status !== 'pending');

  return (
    <PatientLayout activePage="Request Access" onNavigate={handleNav}>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px'
        }}>
          <span style={{ fontSize: '22px' }}>🔐</span>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111' }}>
            Access Requests
          </div>
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '28px' }}>
          Review and manage requests to access your medical records.
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: 'center', padding: '60px',
            color: '#999', fontSize: '15px'
          }}>
            Loading requests...
          </div>
        )}

        {/* Empty state */}
        {!loading && consents.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: 'white', borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              No access requests
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
              When a doctor requests access to your records, it will appear here
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {!loading && pendingConsents.length > 0 && (
          <>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
              🕐 Pending ({pendingConsents.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {pendingConsents.map(consent => (
                <div key={consent._id} style={{
                  backgroundColor: '#2D6A4F',
                  borderRadius: '20px',
                  padding: '24px',
                  color: 'white'
                }}>
                  {/* Doctor name */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '12px', marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '44px', height: '44px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0
                    }}>
                      👤
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                      {consent.doctorName || 'Unknown Doctor'}
                    </div>
                  </div>

                  {/* Reason + Date box */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: '12px'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: 'bold', color: '#111',
                          fontSize: '15px', marginBottom: '6px'
                        }}>
                          Reason for access :
                        </div>
                        <div style={{ color: '#555', fontSize: '14px' }}>
                          {consent.reason || 'No reason provided'}
                        </div>
                        {consent.hospitalName && (
                          <div style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
                            🏥 {consent.hospitalName}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontWeight: 'bold', color: '#111',
                        fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0
                      }}>
                        Date : {formatDate(consent.requestDate)}
                      </div>
                    </div>
                  </div>

                  {/* Approve / Deny buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleRespond(consent._id, 'approved')}
                      disabled={responding === consent._id}
                      style={{
                        flex: 1, height: '48px',
                        borderRadius: '50px',
                        backgroundColor: '#2ECC71',
                        color: 'white', border: 'none',
                        fontWeight: 'bold', fontSize: '16px',
                        cursor: responding === consent._id ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px'
                      }}
                    >
                      {responding === consent._id ? '...' : '✓ Approve request'}
                    </button>
                    <button
                      onClick={() => handleRespond(consent._id, 'denied')}
                      disabled={responding === consent._id}
                      style={{
                        flex: 1, height: '48px',
                        borderRadius: '50px',
                        backgroundColor: '#E53935',
                        color: 'white', border: 'none',
                        fontWeight: 'bold', fontSize: '16px',
                        cursor: responding === consent._id ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px'
                      }}
                    >
                      {responding === consent._id ? '...' : '✕ Deny request'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Resolved Requests */}
        {!loading && resolvedConsents.length > 0 && (
          <>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
              📋 Previous Requests ({resolvedConsents.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {resolvedConsents.map(consent => (
                <div key={consent._id} style={{
                  backgroundColor: '#2D6A4F',
                  borderRadius: '20px',
                  padding: '24px',
                  color: 'white'
                }}>
                  {/* Doctor name */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '12px', marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '44px', height: '44px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0
                    }}>
                      👤
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                      {consent.doctorName || 'Unknown Doctor'}
                    </div>
                  </div>

                  {/* Reason + Date box */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: '12px'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: 'bold', color: '#111',
                          fontSize: '15px', marginBottom: '6px'
                        }}>
                          Reason for access :
                        </div>
                        <div style={{ color: '#555', fontSize: '14px' }}>
                          {consent.reason || 'No reason provided'}
                        </div>
                        {consent.hospitalName && (
                          <div style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
                            🏥 {consent.hospitalName}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontWeight: 'bold', color: '#111',
                        fontSize: '14px', whiteSpace: 'nowrap', flexShrink: 0
                      }}>
                        Date : {formatDate(consent.requestDate)}
                      </div>
                    </div>
                  </div>

                  {/* Status line — matches Figma "Approved on" / "Denied on" */}
                  <div style={{
                    fontSize: '16px', fontWeight: '500',
                    color: consent.status === 'approved'
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(255,200,200,0.95)'
                  }}>
                    {consent.status === 'approved' ? '✅' : '❌'}{' '}
                    {consent.status === 'approved' ? 'Approved' : 'Denied'} on{' '}
                    {formatDate(consent.responseDate || consent.requestDate)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </PatientLayout>
  );
};

export default PatientRequestAccess;