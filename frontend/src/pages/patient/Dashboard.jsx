import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { getUser, getRole, calculateAge } from '../../utils/auth';
import { api } from '../../services/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const userFromStorage = getUser();
  const userRole = getRole();
  const [userProfile, setUserProfile] = useState(userFromStorage);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 🔐 Validate that the logged-in user is actually a patient
  if (!userFromStorage || !userRole || userRole !== 'patient') {
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

  const age = userProfile?.dob ? calculateAge(userProfile.dob) : userProfile?.age || '—';

  const [stats, setStats] = useState({ recordsCount: 0, accessLogsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientId = userFromStorage?._id || userFromStorage?.id;
        if (!patientId) return;
        
        // Fetch fresh profile data from database
        const profileData = await api.get(`/patient/profile/${patientId}`);
        if (profileData?.patient) {
          setUserProfile(profileData.patient);
        }
        
        // Fetch stats
        const statsData = await api.get(`/patient/stats/${patientId}`);
        if (statsData?.stats) setStats(statsData.stats);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userFromStorage]);

  const allergiesList = userProfile?.allergies
    ? userProfile.allergies.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  const handleNav = (page) => {
    const routes = {
      'Overview':        '/patient/dashboard',
      'Medical Records': '/patient/medical-records',
      'Consent Settings':'/patient/consent',
      'Request Access':  '/patient/request-access',
      'Audit Trail':     '/patient/audit-trail',
      'Prescription':    '/patient/prescriptions',
      'Edit Profile':    '/patient/edit-profile'
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

        {/* Patient Info Card - Responsive */}
        <div style={{
          backgroundColor: '#2D6A4F', borderRadius: '20px', 
          padding: isMobile ? '16px' : '28px',
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center', 
          gap: isMobile ? '12px' : '24px',
          color: 'white', marginBottom: '24px'
        }}>
          {/* ── Avatar — shows profile photo if uploaded, else initials ── */}
          <div
            onClick={() => navigate('/patient/edit-profile')}
            style={{
              width: isMobile ? '64px' : '80px', 
              height: isMobile ? '64px' : '80px', 
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold',
              overflow: 'hidden', flexShrink: 0,
              border: '3px solid rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'transform 0.2s',
              position: 'relative',
              minWidth: isMobile ? '64px' : '80px',
              minHeight: isMobile ? '64px' : '80px'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Click to edit profile"
          >
            {userProfile?.profileImage ? (
              <img
                src={userProfile.profileImage}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '?'
            )}
            <div style={{
              position: 'absolute', bottom: '0', right: '0',
              backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%',
              width: '24px', height: '24px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '12px'
            }}>✎</div>
          </div>

          {/* Info - Responsive text sizes */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? '18px' : '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              {userProfile?.name || 'Patient Name'}
            </div>
            <div style={{ fontSize: isMobile ? '12px' : '15px', fontWeight: '600', marginBottom: '4px', wordBreak: 'break-word' }}>
              Patient ID : {userProfile?.patientId || userProfile?._id?.slice(-6) || '—'}
            </div>
            <div style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'pre-wrap' : 'nowrap' }}>
              Aadhaar: {userProfile?.aadhaarId || '—'}
            </div>
            <div style={{ fontSize: isMobile ? '12px' : '14px' }}>
              Age : {age} &nbsp;|&nbsp; 📞 {userProfile?.phone || '—'}
            </div>
          </div>

          {/* Edit Profile Button - Responsive */}
          <button
            onClick={() => navigate('/patient/edit-profile')}
            style={{
              marginLeft: isMobile ? '0' : 'auto',
              border: '2px solid white',
              borderRadius: '8px', 
              padding: isMobile ? '8px 12px' : '8px 16px',
              fontWeight: 'bold', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white', cursor: 'pointer', 
              fontSize: isMobile ? '12px' : '13px',
              transition: 'background-color 0.2s', 
              whiteSpace: 'nowrap',
              width: isMobile ? '100%' : 'auto',
              minHeight: '44px'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
          >
            ✎ {isMobile ? 'Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Stats Row - Responsive grid */}
        <div style={{
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '16px', 
          marginBottom: '24px'
        }}>
          {/* Blood Group */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', 
            padding: isMobile ? '14px' : '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            minHeight: isMobile ? '100px' : 'auto'
          }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              BLOOD GROUP
            </div>
            <div style={{ fontSize: isMobile ? '20px' : '28px', marginTop: '4px' }}>💧</div>
            <div style={{ fontSize: isMobile ? '28px' : '48px', fontWeight: '900', color: '#2D6A4F', lineHeight: 1.1, marginTop: '4px' }}>
              {userProfile?.bloodGroup || '—'}
            </div>
          </div>

          {/* Medical Reports */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', 
            padding: isMobile ? '14px' : '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            minHeight: isMobile ? '100px' : 'auto'
          }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              MEDICAL REPORTS
            </div>
            <div style={{ fontSize: isMobile ? '20px' : '28px', marginTop: '4px' }}>🛡️</div>
            <div style={{ fontSize: isMobile ? '28px' : '48px', fontWeight: '900', color: '#2D6A4F', lineHeight: 1.1, marginTop: '4px' }}>
              {loading ? '—' : stats.recordsCount}
            </div>
          </div>

          {/* Guardian Contact */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', 
            padding: isMobile ? '14px' : '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            minHeight: isMobile ? '100px' : 'auto'
          }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              GUARDIAN CONTACT
            </div>
            <div style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 'bold', color: '#2D6A4F', marginTop: '8px', wordBreak: 'break-word' }}>
              {userProfile?.guardianContact || '—'}
            </div>
          </div>

          {/* Access Logs */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', 
            padding: isMobile ? '14px' : '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            minHeight: isMobile ? '100px' : 'auto'
          }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ACCESS LOGS
            </div>
            <div style={{ fontSize: isMobile ? '20px' : '28px', marginTop: '4px' }}>👤</div>
            <div style={{ fontSize: isMobile ? '28px' : '48px', fontWeight: '900', color: '#2D6A4F', lineHeight: 1.1, marginTop: '4px' }}>
              {loading ? '—' : String(stats.accessLogsCount).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Two Column Grid - Responsive */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: isMobile ? '12px' : '16px' 
        }}>

          {/* Allergies */}
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', 
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold', marginBottom: '16px' }}>
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
                      width: '10px', height: '10px',
                      backgroundColor: '#2D6A4F', borderRadius: '50%', flexShrink: 0
                    }} />
                    <span style={{ fontSize: isMobile ? '13px' : '15px', wordBreak: 'break-word' }}>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#999', fontSize: isMobile ? '12px' : '14px' }}>No allergies recorded</p>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', 
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: '📋 View Medical Records', path: '/patient/medical-records' },
                { label: '💊 View Prescriptions',   path: '/patient/prescriptions'   },
                { label: '🔐 Manage Consent',        path: '/patient/consent'         },
                { label: '📜 Audit Trail',            path: '/patient/audit-trail'    },
              ].map(action => (
                <button 
                  key={action.path} 
                  onClick={() => navigate(action.path)} 
                  style={{
                    width: '100%', 
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    backgroundColor: '#F0F7F4', 
                    border: '1.5px solid #2D6A4F',
                    borderRadius: '12px', 
                    color: '#2D6A4F',
                    fontSize: isMobile ? '12px' : '14px', 
                    fontWeight: '600',
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    transition: 'background-color 0.2s',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
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