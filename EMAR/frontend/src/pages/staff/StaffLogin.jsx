import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiService';

const StaffLogin = () => {
  const [formData, setFormData] = useState({ staffId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('🔐 Starting login for:', formData.staffId);
      const result = await authService.staffLogin(formData.staffId, formData.password);
      console.log('✅ Login successful:', result);
      console.log('🏥 Hospital Name from API:', result.user?.hospitalName);
      console.log('📋 Full user object:', result.user);
      setTimeout(() => navigate('/staff/dashboard'), 500);
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #B30000 0%, #8B0000 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* LEFT SIDE - ILLUSTRATION (Hidden on mobile) */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        display: window.innerWidth >= 1024 ? 'flex' : 'none'
      }}>
        {/* Decorative gradient blobs */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '384px',
          height: '384px',
          backgroundColor: '#FFEBEE',
          borderRadius: '9999px',
          opacity: 0.3,
          filter: 'blur(96px)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '320px',
          height: '320px',
          backgroundColor: '#FFF5F5',
          borderRadius: '9999px',
          opacity: 0.4,
          filter: 'blur(64px)',
          pointerEvents: 'none'
        }}></div>

        {/* Logo positioned absolute */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          zIndex: 10
        }}>
          <img
            src="/images/logo-red.png"
            alt="EMAR"
            style={{ height: '32px', objectFit: 'contain' }}
          />
        </div>

        {/* Staff Illustration - centered */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <img
            src="/images/staff-illustration.png"
            alt="Medical Staff"
            style={{
              width: '320px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
            }}
          />
        </div>

        {/* Bottom accent text */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: 0,
          right: 0,
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#999',
            fontWeight: '500'
          }}>Hospital Staff Portal</p>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: window.innerWidth >= 1024 ? '48px 32px' : '48px 16px'
      }}>
        <div style={{ width: '100%', maxWidth: '448px' }}>
          {/* Mobile Logo */}
          {window.innerWidth < 1024 && (
            <div style={{
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              <img
                src="/images/logo-red.png"
                alt="EMAR"
                style={{
                  height: '28px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          {/* Heading */}
          <div style={{
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 12px 0'
            }}>Login</h1>
            <p style={{
              color: '#FFB3B3',
              fontSize: '14px',
              fontWeight: '500',
              margin: 0
            }}>Access your hospital staff dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Staff ID Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '12px'
              }}>
                Staff ID
              </label>
              <input
                type="text"
                name="username"
                autocomplete="username"
                placeholder="e.g., ST-001"
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.borderColor = 'white';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '12px'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.borderColor = 'white';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 255, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(153, 0, 0, 0.4)',
                border: '2px solid rgba(255, 100, 100, 0.6)',
                borderRadius: '8px'
              }}>
                <p style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: 0
                }}>⚠️ {error}</p>
              </div>
            )}

            {/* Test Credentials Info */}
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                fontWeight: '500',
                margin: 0,
                lineHeight: '1.6'
              }}>
                <span style={{ display: 'block', marginBottom: '6px' }}>Test Credentials:</span>
                <span style={{ display: 'block' }}>ID: <span style={{ fontWeight: 'bold' }}>ST-001</span></span>
                <span style={{ display: 'block' }}>Pass: <span style={{ fontWeight: 'bold' }}>Staff@123</span></span>
              </p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#000',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: '9999px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s',
                transform: loading ? 'scale(0.98)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#222';
                  e.target.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#000';
                  e.target.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {loading ? '⏳ Logging in...' : '🔐 Login Securely'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px'
          }}>
            <p style={{ margin: 0 }}>Secure Hospital Staff Portal • EMAR v1.0</p>
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default StaffLogin;
