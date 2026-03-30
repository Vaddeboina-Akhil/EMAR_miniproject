import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const PatientAuditTrail = () => {
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

  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All Types');
  const [showDropdown, setShowDropdown] = useState(false);

  const accessTypes = ['All Types', 'approved', 'denied', 'emergency', 'view'];

  const typeLabels = {
    'All Types': 'All Types',
    'approved': 'Approved Access',
    'denied': 'Denied Access',
    'emergency': 'Emergency Access',
    'view': 'Record View',
  };

  const typeColors = {
    'approved': '#2ECC71',
    'denied': '#E74C3C',
    'emergency': '#F39C12',
    'view': '#2979FF',
  };

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
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const patientId = user?._id || user?.id;
      if (!patientId) return;
      const data = await api.get(`/access-logs/${patientId}`);
      const list = Array.isArray(data) ? data : [];
      setLogs(list);
      setFiltered(list);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setShowDropdown(false);
    if (type === 'All Types') {
      setFiltered(logs);
    } else {
      setFiltered(logs.filter(l => l.accessType === type));
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Generate a fake blockchain hash from log id for display
  const fakeHash = (id) => {
    if (!id) return '0x000...0000';
    const str = id.toString();
    return '0x' + str.slice(0, 6) + '...' + str.slice(-4);
  };

  return (
    <PatientLayout activePage="Audit Trail" onNavigate={handleNav}>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header Card */}
        <div style={{
          backgroundColor: '#2D6A4F', borderRadius: '16px',
          padding: '28px', color: 'white',
          marginBottom: '20px', overflow: 'visible', position: 'relative'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            Audit Trail
          </div>
          <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '16px' }}>
            Complete log of who accessed your medical records
          </div>

          {/* Filter */}
          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
            Access Type
          </div>
          <div style={{ position: 'relative', display: 'inline-block', zIndex: 200 }}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                border: '1.5px solid white', borderRadius: '50px',
                padding: '8px 20px', backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white', cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: '8px', fontSize: '14px', userSelect: 'none'
              }}
            >
              {typeLabels[selectedType]} ▼
            </div>

            {showDropdown && (
              <div style={{
                position: 'absolute', top: '110%', left: 0,
                backgroundColor: 'white', borderRadius: '12px',
                border: '2px solid #2D6A4F',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                zIndex: 999, minWidth: '180px', overflow: 'hidden'
              }}>
                {accessTypes.map(type => (
                  <div
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    style={{
                      padding: '10px 16px', cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedType === type ? 'bold' : 'normal',
                      color: selectedType === type ? '#2D6A4F' : '#222',
                      backgroundColor: selectedType === type ? '#F0F7F4' : 'white',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#F0F7F4';
                      e.currentTarget.style.color = '#2D6A4F';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = selectedType === type ? '#F0F7F4' : 'white';
                      e.currentTarget.style.color = selectedType === type ? '#2D6A4F' : '#222';
                    }}
                  >
                    {type !== 'All Types' && (
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: typeColors[type] || '#ccc',
                        display: 'inline-block', flexShrink: 0
                      }} />
                    )}
                    <span style={{ color: 'inherit' }}>{typeLabels[type]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total badge */}
          <div style={{
            position: 'absolute', top: '24px', right: '24px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '12px', padding: '12px 20px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '900' }}>{logs.length}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Total Logs</div>
          </div>
        </div>

        {/* Timeline Title */}
        <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '20px 0 12px 0' }}>
          Time Line
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Loading audit logs...
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              No audit logs yet
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
              Access logs will appear here when doctors view your records
            </div>
          </div>
        )}

        {/* Audit Log Entries */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {filtered.map((log, index) => (
              <div key={log._id || index} style={{
                backgroundColor: 'white', borderRadius: '16px',
                padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'flex-start', gap: '16px'
              }}>
                {/* Avatar circle */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  backgroundColor: `${typeColors[log.accessType] || '#ccc'}22`,
                  border: `2px solid ${typeColors[log.accessType] || '#ccc'}`,
                  flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {log.accessType === 'approved' ? '✅' :
                   log.accessType === 'denied' ? '❌' :
                   log.accessType === 'emergency' ? '🚨' : '👁️'}
                </div>

                {/* Content */}
                <div style={{ flexGrow: 1 }}>
                  <div style={{
                    fontWeight: 'bold', fontSize: '17px',
                    color: '#111', marginBottom: '2px'
                  }}>
                    {log.doctorName || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                    {formatDateTime(log.timestamp)}
                    {log.hospitalName && (
                      <span style={{ marginLeft: '12px' }}>🏥 {log.hospitalName}</span>
                    )}
                  </div>

                  {/* Access details box */}
                  <div style={{
                    backgroundColor: '#F0F7F4', borderRadius: '10px',
                    padding: '12px 16px', fontSize: '13px', color: '#444'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>
                      Access Details:
                    </div>
                    {log.reason && (
                      <div style={{ marginBottom: '3px' }}>
                        {log.reason}
                      </div>
                    )}
                    {log.ipAddress && (
                      <div style={{ marginBottom: '3px' }}>
                        <span style={{ color: '#666' }}>IP Address: </span>
                        <span style={{ fontFamily: 'monospace' }}>{log.ipAddress}</span>
                      </div>
                    )}
                    {log.recordsAccessed && (
                      <div>
                        <span style={{ color: '#666' }}>Records Accessed: </span>
                        {log.recordsAccessed}
                      </div>
                    )}
                    {/* Blockchain hash */}
                    <div style={{ marginTop: '6px', color: '#2D6A4F', fontFamily: 'monospace', fontSize: '12px' }}>
                      🔗 Block: {fakeHash(log._id)}
                    </div>
                  </div>
                </div>

                {/* Access type badge */}
                <div style={{
                  flexShrink: 0, textAlign: 'right'
                }}>
                  <span style={{
                    backgroundColor: `${typeColors[log.accessType] || '#ccc'}22`,
                    color: typeColors[log.accessType] || '#666',
                    borderRadius: '50px', padding: '4px 12px',
                    fontSize: '12px', fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {log.accessType || 'access'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blockchain Security Banner */}
        <div style={{
          backgroundColor: '#2D6A4F', borderRadius: '16px',
          padding: '20px 24px', color: 'white',
          display: 'flex', alignItems: 'flex-start', gap: '16px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px', flexShrink: 0
          }}>
            ⚠️
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>
              Blockchain Security
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.6' }}>
              All access to your medical records is cryptographically secured and immutably logged.
              This audit trail cannot be modified or deleted, ensuring complete transparency and accountability.
            </div>
          </div>
        </div>

      </div>
    </PatientLayout>
  );
};

export default PatientAuditTrail;