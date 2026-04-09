import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../utils/auth';
import { api } from '../../services/api';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('patient');
  const [displayRole, setDisplayRole] = useState('patient');
  const [animState, setAnimState] = useState('idle');
  const [slideDir, setSlideDir] = useState('left');
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      height: '100vh', 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      overflow: isMobile ? 'auto' : 'hidden',
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

      {/* Mobile Header - Logo & Illustration as background */}
      {isMobile && (
        <div style={{
          backgroundColor: '#F0F4F8',
          padding: '20px',
          textAlign: 'center',
          borderBottom: '2px solid #E0E0E0',
          backgroundImage: `url(${displayRole === 'patient' ? '/images/patient-illustration.png' : '/images/doctor-illustration.png'})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          minHeight: '140px',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '0px', ...getAnimStyle(), position: 'relative', zIndex: 10 }}>
            <img
              src={displayRole === 'patient' ? '/images/logo-green.png' : '/images/logo-blue.png'}
              alt="EMAR"
              style={{ height: '20px', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* LEFT HALF - Desktop only */}
      <div style={{
        display: isMobile ? 'none' : 'flex',
        flex: '0 0 45%', 
        backgroundColor: '#F0F4F8',
        position: 'relative', 
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, ...getAnimStyle() }}>
          <img
            src={displayRole === 'patient' ? '/images/logo-green.png' : '/images/logo-blue.png'}
            alt="EMAR"
            style={{ height: '25px', objectFit: 'contain' }}
          />
        </div>

        <svg viewBox="0 0 500 700" preserveAspectRatio="none" style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', zIndex: 1
        }}>
          <path d="M0,0 L320,0 Q480,100 490,350 Q480,600 320,700 L0,700 Z" fill="white" />
        </svg>

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

      {/* RIGHT HALF - Full width on mobile */}
      <div style={{
        flex: isMobile ? 1 : 1,
        backgroundColor: roleColors[selectedRole],
        padding: isMobile ? '20px' : '60px',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: isMobile ? 'flex-start' : 'center',
        paddingTop: isMobile ? '40px' : '60px',
        transition: animState === 'idle' ? 'background-color 0.4s ease' : 'none',
        overflow: isMobile ? 'visible' : 'auto',
        minHeight: isMobile ? 'auto' : '100vh'
      }}>
        <h1 style={{
          fontSize: isMobile ? '32px' : '52px', 
          fontWeight: '900',
          color: 'white', 
          marginBottom: isMobile ? '20px' : '32px', 
          lineHeight: '1.1'
        }}>
          Login as
        </h1>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)', 
          borderRadius: '50px',
          padding: '4px', 
          display: 'flex', 
          marginBottom: isMobile ? '20px' : '32px', 
          width: 'fit-content'
        }}>
          {roleTabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => handleRoleChange(tab.key)}
              style={{
                backgroundColor: selectedRole === tab.key ? 'white' : 'transparent',
                color: selectedRole === tab.key ? roleColors[tab.key] : 'white',
                padding: isMobile ? '8px 16px' : '10px 24px', 
                borderRadius: '50px',
                fontWeight: selectedRole === tab.key ? 'bold' : 'normal',
                fontSize: isMobile ? '14px' : '16px', 
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'all 0.25s ease', 
                whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontWeight: 'bold', 
              color: 'white',
              fontSize: isMobile ? '14px' : '16px', 
              display: 'block', 
              marginBottom: '8px'
            }}>
              {config.label1}
            </label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder={config.placeholder1}
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              style={{
                width: '100%', 
                padding: isMobile ? '12px 18px' : '14px 22px', 
                borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none', 
                color: 'white', 
                fontSize: isMobile ? '14px' : '16px',
                outline: 'none', 
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
            <label style={{
              fontWeight: 'bold', 
              color: 'white',
              fontSize: isMobile ? '14px' : '16px', 
              display: 'block', 
              marginBottom: '8px'
            }}>
              {config.label2}
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%', 
                padding: isMobile ? '12px 18px' : '14px 22px', 
                borderRadius: '50px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none', 
                color: 'white', 
                fontSize: isMobile ? '14px' : '16px',
                outline: 'none', 
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div
            role="button"
            onClick={handleSubmit}
            style={{
              width: '100%',
              height: isMobile ? '50px' : '56px',
              borderRadius: '50px',
              backgroundColor: isLoading ? '#ccc' : buttonColors[selectedRole],
              color: isLoading ? '#666' : 'white',
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.4s ease',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '⏳ Logging in...' : 'Login Securely'}
          </div>
        </div>

        <p style={{ 
          color: 'white', 
          textAlign: 'center', 
          marginTop: isMobile ? '16px' : '20px', 
          marginBottom: isMobile ? '30px' : '20px',
          fontSize: isMobile ? '12px' : '14px' 
        }}>
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