import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { getUser, getRole } from '../../utils/auth';

const ConsentPage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userRole = getRole();

  // 🔐 Validate that the logged-in user is actually a patient
  if (!user || !userRole || userRole !== 'patient') {
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

  const [accessLevels, setAccessLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('emar_access_levels');
      return saved ? JSON.parse(saved) : {
        basic: true,
        prescription: true,
        full: true,
        emergency: true,
        researchAnonymous: false,
        insuranceClaims: false,
        telehealth: false,
      };
    } catch {
      return {
        basic: true,
        prescription: true,
        full: true,
        emergency: true,
        researchAnonymous: false,
        insuranceClaims: false,
        telehealth: false,
      };
    }
  });

  const [saveMsg, setSaveMsg] = useState('');

  const handleNav = (page) => {
    const routes = {
      'Overview': '/patient/dashboard',
      'Medical Records': '/patient/medical-records',
      'Consent Settings': '/patient/consent',
      'Request Access': '/patient/request-access',
      'Audit Trail': '/patient/audit-trail',
      'Prescription': '/patient/prescriptions',
      'Edit Profile': '/patient/edit-profile'
    };
    navigate(routes[page]);
  };

  // ✅ Only called once — no bubbling
  const toggle = (key) => {
    setAccessLevels(prev => ({ ...prev, [key]: !prev[key] }));
    setSaveMsg('');
  };

  const saveSettings = () => {
    localStorage.setItem('emar_access_levels', JSON.stringify(accessLevels));
    setSaveMsg('✅ Settings saved!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  // ✅ Toggle purely visual — click handled by parent row only
  const Toggle = ({ active }) => (
    <div style={{
      width: '52px', height: '28px',
      backgroundColor: active ? '#4FC3F7' : '#ccc',
      borderRadius: '14px', position: 'relative',
      transition: 'background-color 0.25s ease',
      flexShrink: 0, pointerEvents: 'none' // ✅ prevents double-fire
    }}>
      <div style={{
        width: '22px', height: '22px',
        backgroundColor: 'white',
        borderRadius: '50%', position: 'absolute',
        top: '3px',
        left: active ? '27px' : '3px',
        transition: 'left 0.25s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  );

  // ✅ Only outer row handles click
  const AccessRow = ({ keyName, title, desc, active }) => (
    <div
      onClick={() => toggle(keyName)}
      style={{
        backgroundColor: active ? '#2D6A4F' : 'transparent',
        borderRadius: '12px', padding: '16px 20px',
        marginBottom: '10px', cursor: 'pointer',
        transition: 'background-color 0.25s ease',
        border: active ? 'none' : '1px solid #eee',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{
            fontWeight: 'bold', fontSize: '16px',
            color: active ? 'white' : '#2D6A4F'
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '13px', marginTop: '2px',
            color: active ? 'rgba(255,255,255,0.8)' : '#666'
          }}>
            {desc}
          </div>
        </div>
        <Toggle active={active} />
      </div>
    </div>
  );

  const sectionStyle = {
    border: '1.5px solid #ddd',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    backgroundColor: 'white'
  };

  const sectionTitle = (icon, text) => (
    <div style={{
      fontSize: '18px', fontWeight: 'bold',
      marginBottom: '16px', display: 'flex',
      alignItems: 'center', gap: '10px', color: '#111'
    }}>
      <span>{icon}</span> {text}
    </div>
  );

  return (
    <PatientLayout activePage="Consent Settings" onNavigate={handleNav}>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <span style={{ fontSize: '22px' }}>🛡️</span>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111' }}>
            Privacy & Consent Settings
          </div>
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '28px' }}>
          Control who can access your medical information
        </div>

        {/* SECTION 1 — Access Levels */}
        <div style={sectionStyle}>
          {sectionTitle('🔒', 'Access Levels')}
          <AccessRow keyName="basic" title="Basic Information"
            desc="Name, Age, Blood group and Emergency Contacts" active={accessLevels.basic} />
          <AccessRow keyName="prescription" title="Prescription History"
            desc="Current medications and prescription records" active={accessLevels.prescription} />
          <AccessRow keyName="full" title="Full Medical Reports"
            desc="Complete medical history and lab reports imaging" active={accessLevels.full} />
        </div>

        {/* SECTION 2 — Emergency Access */}
        <div style={sectionStyle}>
          {sectionTitle('⚠️', 'Emergency Access')}
          <div
            onClick={() => toggle('emergency')}
            style={{
              backgroundColor: accessLevels.emergency ? '#2D6A4F' : '#F9FAFB',
              borderRadius: '12px', padding: '16px 20px',
              cursor: 'pointer', transition: 'background-color 0.25s ease',
              border: accessLevels.emergency ? 'none' : '1px solid #eee',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <div style={{
                  fontWeight: 'bold', fontSize: '16px',
                  color: accessLevels.emergency ? 'white' : '#2D6A4F'
                }}>
                  Allow Emergency Access
                </div>
                <div style={{
                  fontSize: '13px', marginTop: '2px',
                  color: accessLevels.emergency ? 'rgba(255,255,255,0.8)' : '#666'
                }}>
                  Emergency medical staff can access critical information when you're unconscious
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 'bold', marginBottom: '6px',
                    color: accessLevels.emergency ? 'rgba(255,255,255,0.9)' : '#555'
                  }}>
                    Emergency access includes:
                  </div>
                  {['Blood group and allergies', 'Chronic conditions', 'Emergency contacts', 'Critical medications'].map(item => (
                    <div key={item} style={{
                      fontSize: '13px', marginBottom: '3px',
                      color: accessLevels.emergency ? 'rgba(255,255,255,0.85)' : '#666'
                    }}>
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
              <Toggle active={accessLevels.emergency} />
            </div>
          </div>
        </div>

        {/* SECTION 3 — Additional Consent Settings */}
        <div style={sectionStyle}>
          {sectionTitle('⚙️', 'Additional Consent Settings')}
          <AccessRow keyName="researchAnonymous" title="Anonymous Research Use"
            desc="Allow your anonymized data to be used for medical research (no personal info shared)"
            active={accessLevels.researchAnonymous} />
          <AccessRow keyName="insuranceClaims" title="Insurance Claims Access"
            desc="Allow insurance providers to access records for claim processing"
            active={accessLevels.insuranceClaims} />
          <AccessRow keyName="telehealth" title="Telehealth Consultations"
            desc="Allow doctors to access records during video/remote consultations"
            active={accessLevels.telehealth} />
        </div>

        {/* SECTION 4 — Trusted Healthcare Providers */}
        <div style={sectionStyle}>
          {sectionTitle('👥', 'Trusted Healthcare Providers')}
          <div style={{
            backgroundColor: '#2D6A4F', borderRadius: '12px',
            padding: '16px 20px', color: 'white'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
              Approved Doctors
            </div>
            <div style={{ marginBottom: '14px' }}>
              <span style={{
                backgroundColor: 'white', color: '#2D6A4F',
                borderRadius: '50px', padding: '4px 14px',
                fontSize: '13px', fontWeight: '500', display: 'inline-block'
              }}>
                Managed via Request Access page
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
              How it works
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>
              When a doctor requests access to your records, you will receive a notification on the{' '}
              <strong>Request Access</strong> page. You can approve or deny each request individually.
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          alignItems: 'center', gap: '16px', marginBottom: '32px'
        }}>
          {saveMsg && (
            <span style={{ color: '#2ECC71', fontWeight: 'bold', fontSize: '14px' }}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={saveSettings}
            style={{
              backgroundColor: '#2979FF', color: 'white',
              borderRadius: '50px', padding: '12px 32px',
              fontWeight: 'bold', fontSize: '16px',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(41,121,255,0.3)'
            }}
          >
            Save Consent Settings
          </button>
        </div>

      </div>
    </PatientLayout>
  );
};

export default ConsentPage;