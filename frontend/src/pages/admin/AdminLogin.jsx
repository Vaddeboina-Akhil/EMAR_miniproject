import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../utils/auth';
import { api } from '../../services/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔐 Admin login attempt:', { email: formData.email });
      const result = await api.post('/auth/admin/login', {
        email: formData.email.trim(),
        password: formData.password
      });

      console.log('✅ Admin login successful:', result);
      
      localStorage.setItem('emar_token', result.token);
      localStorage.setItem('emar_role', 'admin');
      setUser(result.user);
      
      console.log('📍 Navigating to admin dashboard...');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err.message);
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f1419',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '900',
            color: '#111',
            marginBottom: '8px'
          }}>
            EMAR
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: '600'
          }}>
            Admin Portal
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@emar.com"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#1a237e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#0d1547';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#1a237e';
            }}
          >
            {isLoading ? '⏳ Logging in...' : '🔐 Login as Admin'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <strong>Demo Credentials:</strong>
          <br />
          Email: admin@emar.com
          <br />
          Password: admin@123
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
