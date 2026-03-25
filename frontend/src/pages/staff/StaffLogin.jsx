import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const StaffLogin = () => {
  const [formData, setFormData] = useState({ staffId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.post('/auth/staff/login', {
        staffId: formData.staffId,
        password: formData.password,
      });
      if (result.token) {
        localStorage.setItem('emar_token', result.token);
        localStorage.setItem('emar_role', 'staff');
        navigate('/staff/search');
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (error) {
      alert(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 22px',
    borderRadius: '50px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: 'white',
    fontSize: '16px',
    display: 'block',
    marginBottom: '8px',
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <style>{`input::placeholder { color: rgba(255,255,255,0.55) !important; }`}</style>

      {/* LEFT HALF */}
      <div style={{
        flex: '0 0 45%',
        backgroundColor: '#F0F4F8',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
          <img src="/images/logo-red.png" alt="EMAR" style={{ height: '48px', objectFit: 'contain' }} />
        </div>

        {/* White blob */}
        <svg viewBox="0 0 500 700" preserveAspectRatio="none" style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', zIndex: 1,
        }}>
          <path d="M0,0 L320,0 Q480,100 490,350 Q480,600 320,700 L0,700 Z" fill="white" />
        </svg>

        {/* Illustration */}
        <div style={{
          position: 'absolute', zIndex: 2,
          bottom: '60px', left: '40px', width: '320px',
        }}>
          <img
            src="/images/staff-illustration.png"
            alt="Staff illustration"
            style={{ width: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Secret portal badge */}
        <div style={{
          position: 'absolute', bottom: '24px', right: '24px', zIndex: 10,
          backgroundColor: '#B71C1C', color: 'white',
          fontSize: '11px', fontWeight: 'bold',
          padding: '6px 14px', borderRadius: '50px',
          letterSpacing: '1px',
        }}>
          🔐 INTERNAL ACCESS ONLY
        </div>
      </div>

      {/* RIGHT HALF */}
      <div style={{
        flex: 1,
        backgroundColor: '#7B1C1C',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white', fontSize: '12px',
            fontWeight: 'bold', letterSpacing: '2px',
            padding: '6px 16px', borderRadius: '50px',
          }}>
            HOSPITAL STAFF PORTAL
          </span>
        </div>

        <h1 style={{
          fontSize: '52px', fontWeight: '900',
          color: 'white', marginBottom: '8px',
          lineHeight: '1.1', marginTop: '16px',
        }}>
          Staff Login
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: '15px', marginBottom: '36px',
        }}>
          Authorized hospital staff only.<br />
          All access is monitored and blockchain-audited.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Staff ID</label>
            <input
              type="text"
              placeholder="e.g., ST-001"
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: '56px',
              borderRadius: '50px',
              backgroundColor: loading ? 'rgba(255,255,255,0.3)' : '#E53935',
              color: 'white', fontSize: '20px',
              fontWeight: 'bold', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in as Staff'}
          </button>
        </form>

        <p style={{
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center', marginTop: '32px', fontSize: '12px',
        }}>
          Not a staff member?{' '}
          <span
            onClick={() => navigate('/')}
            style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Go to patient / doctor login
          </span>
        </p>

        <p style={{
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center', marginTop: '12px', fontSize: '11px',
        }}>
          © 2025 EMAR — All access is encrypted and blockchain-audited
        </p>
      </div>
    </div>
  );
};

export default StaffLogin;