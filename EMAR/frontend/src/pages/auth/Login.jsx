import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../utils/auth';
import { api } from '../../services/api';
import './Login.css';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [displayRole, setDisplayRole] = useState('patient');
  const [animState, setAnimState] = useState('idle');
  const [slideDir, setSlideDir] = useState('left');
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
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
    setFormData({ id: '', password: '' });
    setTimeout(() => {
      setDisplayRole(newRole);
      setAnimState('enter');
      setTimeout(() => setAnimState('idle'), 350);
    }, 300);
  };

  const handleSubmit = async () => {
    if (isLoading) {
      console.log('⏳ Already loading, ignoring duplicate click');
      return;
    }
    
    console.log('🔐 Login attempt:', { selectedRole, licenseId: formData.id, password: '***' });
    setIsLoading(true);
    
    // Safety timeout - reset loading after 10 seconds
    const timeout = setTimeout(() => {
      console.error('❌ Login timeout - taking too long');
      setIsLoading(false);
      alert('Login taking too long. Please try again.');
    }, 10000);
    
    try {
      if (selectedRole === 'doctor') {
        console.log('🏥 Logging in as doctor...');
        try {
          const result = await api.post('/auth/doctor/login', { licenseId: formData.id.trim(), password: formData.password.trim() });
          console.log('✅ Doctor login result:', result);
          console.log('   - Has token?', !!result.token);
          console.log('   - Has user?', !!result.user);
          console.log('   - Token:', result.token ? result.token.substring(0, 20) + '...' : 'NO TOKEN');
          console.log('   - User:', result.user);
          
          if (!result.token) {
            console.error('❌ No token in response');
            clearTimeout(timeout);
            alert('No token received: ' + (result.message || 'Unknown error'));
            setIsLoading(false);
            return;
          }
          
          if (!result.user) {
            console.error('❌ No user in response');
            alert('No user data received');
            setIsLoading(false);
            return;
          }
          
          console.log('💾 Setting localStorage token...');
          localStorage.setItem('emar_token', result.token);
          localStorage.setItem('emar_role', 'doctor');
          console.log('✅ Token saved to localStorage');
          
          console.log('👤 Calling setUser...');
          setUser(result.user);
          console.log('✅ setUser called');
          
          console.log('📍 Navigating to /doctor/overview...');
          clearTimeout(timeout);
          navigate('/doctor/overview');
          console.log('✅ Navigation called');
        } catch (apiError) {
          console.error('❌ API Error:', apiError);
          clearTimeout(timeout);
          setIsLoading(false);
          throw apiError;
        }
        return;
      }
      if (selectedRole === 'patient') {
        console.log('👤 Logging in as patient...');
        const result = await api.post('/auth/patient/login', { aadhaarId: formData.id.trim(), password: formData.password.trim() });
        console.log('✅ Patient login result:', result);
        if (result.token) {
          localStorage.setItem('emar_token', result.token);
          localStorage.setItem('emar_role', 'patient');
          setUser(result.user);
          clearTimeout(timeout);
          navigate('/patient/dashboard');
        } else {
          clearTimeout(timeout);
          alert(result.message || 'Login failed');
          setIsLoading(false);
        }
        return;
      }
    } catch (error) {
      console.error('❌ Login error caught:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      clearTimeout(timeout);
      alert('Login Error: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  const roleTabs = [
    { key: 'patient', icon: '👤', label: 'Patient' },
    { key: 'doctor', icon: '🏥', label: 'Doctor' },
  ];

  const getAnimClass = () => {
    if (animState === 'exit') {
      return slideDir === 'left' ? 'login-anim-slide-out-left' : 'login-anim-slide-out-right';
    }
    if (animState === 'enter') {
      return slideDir === 'left' ? 'login-anim-slide-in-left' : 'login-anim-slide-in-right';
    }
    return '';
  };

  return (
    <div className="login-container" style={{ backgroundColor: roleColors[selectedRole] }}>
      {/* Mobile Header - Logo & Illustration as background */}
      <div
        className="login-mobile-header"
        style={{
          backgroundImage: `url(${
            displayRole === 'patient' ? '/images/patient-illustration.png' : '/images/doctor-illustration.png'
          })`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
        }}
      >
        <div className={getAnimClass()}>
          <img
            src={displayRole === 'patient' ? '/images/logo-green.png' : '/images/logo-blue.png'}
            alt="EMAR"
          />
        </div>
      </div>

      {/* LEFT HALF - Desktop only */}
      <div className="login-left-half">
        <div className={`login-logo-left ${getAnimClass()}`}>
          <img
            src={displayRole === 'patient' ? '/images/logo-green.png' : '/images/logo-blue.png'}
            alt="EMAR"
          />
        </div>

        <svg viewBox="0 0 500 700" preserveAspectRatio="none">
          <path d="M0,0 L320,0 Q480,100 490,350 Q480,600 320,700 L0,700 Z" fill="white" />
        </svg>

        <div className={`login-illustration-left ${getAnimClass()}`}>
          <img
            src={
              displayRole === 'patient' ? '/images/patient-illustration.png' : '/images/doctor-illustration.png'
            }
            alt="illustration"
          />
        </div>
      </div>

      {/* RIGHT HALF - Full width on mobile */}
      <div className="login-right-half">
        <div className="login-form-container">
          <h1 className={`login-title ${getAnimClass()}`}>Login as</h1>

          <div className="login-role-tabs">
            {roleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleRoleChange(tab.key)}
                className={`login-role-tab ${selectedRole === tab.key ? 'active' : ''}`}
                style={{
                  color: selectedRole === tab.key ? roleColors[tab.key] : 'white',
                }}
                aria-pressed={selectedRole === tab.key}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div>
            <div className="login-form-group">
              <label className="login-form-label">{config.label1}</label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                placeholder={config.placeholder1}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="login-form-input"
              />
            </div>

            <div className="login-form-group">
              <label className="login-form-label">{config.label2}</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="login-form-input"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="login-button"
              style={{
                backgroundColor: isLoading ? '#ccc' : buttonColors[selectedRole],
                color: isLoading ? '#666' : 'white',
              }}
            >
              {isLoading ? '⏳ Logging in...' : 'Login Securely'}
            </button>
          </div>

          <p className="login-signup-link">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>
              Sign up here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;