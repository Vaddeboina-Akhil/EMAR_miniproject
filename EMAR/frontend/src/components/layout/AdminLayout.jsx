import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const admin = getUser();

  // Check if actually admin
  useEffect(() => {
    if (!admin || admin.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Doctors', path: '/admin/doctors', icon: '👨‍⚕️' },
    { label: 'Patients', path: '/admin/patients', icon: '👥' },
    { label: 'Staff', path: '/admin/staff', icon: '👔' },
    { label: 'Records', path: '/admin/records', icon: '📋' },
    { label: 'Logs', path: '/admin/logs', icon: '📜' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: '#111111', borderRight: '1px solid #222', padding: '20px 0', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px', marginBottom: '30px', fontSize: '20px', fontWeight: 'bold' }}>
          🔐 EMAR Admin
        </div>
        
        {navItems.map(item => (
          <a
            key={item.path}
            href={item.path}
            onClick={e => { e.preventDefault(); navigate(item.path); }}
            style={{
              display: 'block',
              padding: '12px 20px',
              color: window.location.pathname === item.path ? '#3B82F6' : '#999',
              textDecoration: 'none',
              backgroundColor: window.location.pathname === item.path ? '#1a2a4a' : 'transparent',
              borderLeft: window.location.pathname === item.path ? '3px solid #3B82F6' : 'none',
              fontSize: '14px',
              fontWeight: window.location.pathname === item.path ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {item.icon} {item.label}
          </a>
        ))}

        <div style={{ borderTop: '1px solid #222', marginTop: '20px', paddingTop: '20px', margin: '20px 0' }} />
        
        <button
          onClick={() => {
            localStorage.removeItem('emar_user');
            localStorage.removeItem('emar_token');
            navigate('/admin/login');
          }}
          style={{
            display: 'block',
            width: '80%',
            margin: '0 auto',
            padding: '10px 15px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '0' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#111111', borderBottom: '1px solid #222', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{title}</h1>
          <div style={{ fontSize: '14px', color: '#999' }}>
            👤 {admin?.name || admin?.email || 'Admin'}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
