import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../utils/auth';
import { api } from '../../services/api';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [displayRole, setDisplayRole] = useState('patient');
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'exit' | 'enter'
  const [slideDir, setSlideDir] = useState('left');
  const [formData, setFormData] = useState({ id: '', password: '' });
  const navigate = useNavigate();

  const roleColors = {
    patient: '#1E4D35',
    doctor: '#1A237E',
  };

  const buttonColors = {
    patient: '#2ECC71',
    doctor: '#2979FF',
  };

  const roleConfigs = {
    patient: { label1: 'Aadhaar ID', placeholder1: '1234 - 5678 - 1234', label2: 'Password / OTP' },
    doctor: { label1: 'License ID', placeholder1: 'MED123456', label2: 'Password / OTP' },
  };

  const config = roleConfigs[selectedRole];

  const handleRoleChange = (newRole) => {
    if (newRole === selectedRole || animState !== 'idle') return;
    const dir = newRole === 'doctor' ? 'left' : 'right';
    setSlideDir(dir);
    setAnimState('exit');
    setSelectedRole(newRole);
    // After exit animation (300ms), swap image and play enter animation
    setTimeout(() => {
      setDisplayRole(newRole);
      setAnimState('enter');
      setTimeout(() => setAnimState('idle'), 350);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRole === 'patient') {
        const result = await api.post('/auth/patient/login', { aadhaarId: formData.id, password: formData.password });
        if (result.token) {
          localStorage.setItem('emar_token', result.token);
          setUser(result.user);
          navigate('/patient/dashboard');
        } else {
          alert(result.message || 'Login failed');
        }
        return;
      }
      if (selectedRole === 'doctor') {
        const result = await api.post('/auth/doctor/login', { licenseId: formData.id, password: formData.password });
        if (result.token) {
          localStorage.setItem('emar_token', result.token);
          setUser(result.user);
          navigate('/doctor/overview');
        } else {
          alert(result.message || 'Login failed');
        }
        return;
      }
    } catch (error) {
      alert(error.message || 'Login failed');
    }
  };

  const roleTabs = [
    { key: 'patient', icon: '👤', label: 'Patient' },
    { key: 'doctor', icon: '🏥', label: 'Doctor' },
  ];

  const getAnimStyle = () => {
    if (animState === 'exit') {
      return { animation: `slideOut${slideDir === 'left' ? 'Left' : 'Right'} 0.3s ease forwards` };
    }
    if (animState === 'enter') {
      return { animation: `slideIn${slideDir === 'left' ? 'Right' : 'Left'} 0.35s ease forwards` };
    }
    return {};
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-70px); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(70px); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(70px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-70px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* LEFT HALF */}
      <div style={{
        flex: '0 0 45%', backgroundColor: '#F0F4F8',
        position: 'relative', overflow: 'hidden'
      }}>

        {/* Logo — animates with role switch */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, ...getAnimStyle() }}>
          <img
            src={displayRole === 'patient' ? '/images/logo-green.png' : '/images/logo-blue.png'}
            alt="EMAR"
            style={{ height: '25px', objectFit: 'contain' }}
          />
        </div>

        {/* White blob */}
        <svg viewBox="0 0 500 700" preserveAspectRatio="none" style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', zIndex: 1
        }}>
          <path d="M0,0 L320,0 Q480,100 490,350 Q480,600 320,700 L0,700 Z" fill="white" />
        </svg>

        {/* Illustration — animates with role switch */}
        <div style={{
          position: 'absolute', zIndex: 2,
          bottom: '150px', left: '120px', width: '320px',
          ...getAnimStyle()
        }}>
          <img
            src={displayRole === 'patient' ? '/images/patient-illustration.png' : '/images/doctor-illustration.png'}
            alt="illustration"
            style={{ width: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* RIGHT HALF */}
      <div style={{
        flex: 1,
        backgroundColor: roleColors[selectedRole],
        padding: '60px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        transition: 'background-color 0.4s ease'
      }}>
        <h1 style={{
          fontSize: '52px', fontWeight: '900',
          color: 'white', marginBottom: '32px', lineHeight: '1.1'
        }}>
          Login as
        </h1>

        {/* Role Tabs */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50px',
          padding: '4px', display: 'flex', marginBottom: '32px', width: 'fit-content'
        }}>
          {roleTabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => handleRoleChange(tab.key)}
              style={{
                backgroundColor: selectedRole === tab.key ? 'white' : 'transparent',
                color: selectedRole === tab.key ? roleColors[tab.key] : 'white',
                padding: '10px 24px', borderRadius: '50px',
                fontWeight: selectedRole === tab.key ? 'bold' : 'normal',
                fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.25s ease', whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontWeight: 'bold', color: 'white',
              fontSize: '16px', display: 'block', marginBottom: '8px'
            }}>
              {config.label1}
            </label>
            <input
              type="text"
              name="username"
              autocomplete="username"
              placeholder={config.placeholder1}
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              style={{
                width: '100%', padding: '14px 22px', borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none', color: 'white', fontSize: '16px',
                outline: 'none', boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontWeight: 'bold', color: 'white',
              fontSize: '16px', display: 'block', marginBottom: '8px'
            }}>
              {config.label2}
            </label>
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%', padding: '14px 22px', borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none', color: 'white', fontSize: '16px',
                outline: 'none', boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%', height: '56px', borderRadius: '50px',
              backgroundColor: buttonColors[selectedRole],
              color: 'white', fontSize: '20px', fontWeight: 'bold',
              border: 'none', cursor: 'pointer',
              transition: 'background-color 0.4s ease'
            }}
          >
            Login Securely
          </button>
        </form>

        <p style={{ color: 'white', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;