import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { getUser, calculateAge } from '../../utils/auth';
import { api } from '../../services/api';

const PatientDashboard = () => {
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

  const age = user?.dob ? calculateAge(user.dob) : user?.age || '—';

  const [stats, setStats] = useState({ recordsCount: 0, accessLogsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const patientId = user?._id || user?.id;
        if (!patientId) return;
        const data = await api.get(`/patient/stats/${patientId}`);
        if (data?.stats) setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const allergiesList = user?.allergies
    ? user.allergies.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  const handleNav = (page) => {
    const routes = {
      'Overview':        '/patient/dashboard',
      'Medical Records': '/patient/medical-records',
      'Consent Settings':'/patient/consent',
      'Request Access':  '/patient/request-access',
      'Audit Trail':     '/patient/audit-trail',
      'Prescription':    '/patient/prescriptions'
    };
    navigate(routes[page]);
  };

  const statCard = (label, icon, value) => (
    <div style={{
      backgroundColor: 'white', borderRadius: '16px', padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
    }}>
      <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </div>
      {icon && <div style={{ fontSize: '28px', marginTop: '4px' }}>{icon}</div>}
      <div style={{ fontSize: '48px', fontWeight: '900', color: '#2D6A4F', lineHeight: 1.1, marginTop: '4px' }}>
        {loading ? '—' : value}
      </div>
    </div>
  );

  return (
    <PatientLayout activePage="Overview" onNavigate={handleNav}>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Patient Info Card */}
        <div style={{
          backgroundColor: '#2D6A4F', borderRadius: '20px', padding: '28px',
          display: 'flex', alignItems: 'center', gap: '24px',
          color: 'white', marginBottom: '24px'
        }}>
          {/* ── Avatar — shows profile photo if uploaded, else initials ── */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 'bold',
            overflow: 'hidden', flexShrink: 0,
            border: '3px solid rgba(255,255,255,0.4)'
          }}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : '?'
            )}
          </div>

          {/* Info */}
          <div style={{ flexGrow: 1 }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              {user?.name || 'Patient Name'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
              Patient ID : {user?.patientId || user?._id?.slice(-6) || '—'}
            </div>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              Aadhaar: {user?.aadhaarId || '—'}
            </div>
            <div style={{ fontSize: '14px' }}>
              Age : {age} &nbsp;|&nbsp; 📞 {user?.phone || '—'}
            </div>
          </div>

          {/* Status Badge */}
          <div style={{
            marginLeft: 'auto', border: '2px solid white',
            borderRadius: '50px', padding: '6px 16px',
            fontWeight: 'bold', display: 'flex', alignItems: 'center',
            gap: '6px', whiteSpace: 'nowrap'
          }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#2ECC71', borderRadius: '50%' }} />
            ACTIVE
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px', marginBottom: '24px'
        }}>
          {/* Blood Group */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              BLOOD GROUP
            </div>
            <div style={{ fontSize: '28px', marginTop: '4px' }}>💧</div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#2D6A4F' }}>
              {user?.bloodGroup || '—'}
            </div>
          </div>

          {statCard('MEDICAL REPORTS', '🛡️', stats.recordsCount)}

          {/* Guardian Contact */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              GUARDIAN CONTACT
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2D6A4F', marginTop: '8px' }}>
              {user?.guardianContact || '—'}
            </div>
          </div>

          {statCard('ACCESS LOGS', '👤', String(stats.accessLogsCount).padStart(2, '0'))}
        </div>

        {/* Two Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Allergies */}
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Allergies & Critical Info
            </div>
            {allergiesList.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {allergiesList.map((item, i) => (
                  <li key={i} style={{
                    marginBottom: '8px', display: 'flex',
                    alignItems: 'center', gap: '8px'
                  }}>
                    <div style={{
                      width: '12px', height: '12px',
                      backgroundColor: '#2D6A4F', borderRadius: '50%', flexShrink: 0
                    }} />
                    <span style={{ fontSize: '15px' }}>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#999', fontSize: '14px' }}>No allergies recorded</p>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: '📋 View Medical Records', path: '/patient/medical-records' },
                { label: '💊 View Prescriptions',   path: '/patient/prescriptions'   },
                { label: '🔐 Manage Consent',        path: '/patient/consent'         },
                { label: '📜 Audit Trail',            path: '/patient/audit-trail'    },
              ].map(action => (
                <button key={action.path} onClick={() => navigate(action.path)} style={{
                  width: '100%', padding: '12px 16px',
                  backgroundColor: '#F0F7F4', border: '1.5px solid #2D6A4F',
                  borderRadius: '12px', color: '#2D6A4F',
                  fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4edda'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F0F7F4'}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;