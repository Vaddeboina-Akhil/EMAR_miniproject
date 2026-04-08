import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PatientLayout = ({ children, activePage, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { label: 'Overview', path: '/patient/dashboard' },
    { label: 'Medical Records', path: '/patient/medical-records' },
    { label: 'Consent Settings', path: '/patient/consent' },
    { label: 'Request Access', path: '/patient/request-access' },
    { label: 'Audit Trail', path: '/patient/audit-trail' },
    { label: 'Prescription', path: '/patient/prescriptions' },
    { label: 'Edit Profile', path: '/patient/edit-profile' }
  ];

  const isActive = (label) => activePage === label;

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Fixed Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'white',
        borderBottom: '1px solid #E0E0E0',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111',
          cursor: 'pointer'
        }}>
          EMAR
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <div style={{
            border: '1.5px solid #111',
            borderRadius: '50px',
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#2ECC71',
              borderRadius: '50%'
            }} />
            Patient Portal
          </div>
          <button 
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#111',
              color: 'white',
              borderRadius: '50px',
              padding: '8px 20px',
              fontWeight: 'bold',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Fixed Sidebar */}
      <div style={{
        position: 'fixed',
        top: '60px',
        left: 0,
        width: '200px',
        height: 'calc(100vh - 60px)',
        backgroundColor: 'white',
        borderRight: '1px solid #E0E0E0',
        paddingTop: '24px',
        overflowY: 'auto',
        zIndex: 99
      }}>
        {navItems.map((item) => (
          <div
            key={item.label}
            onClick={() => onNavigate ? onNavigate(item.label) : navigate(item.path)}
            style={{
              padding: '12px 20px',
              margin: '4px 12px',
              fontSize: '15px',
              cursor: 'pointer',
              borderRadius: '10px',
              backgroundColor: isActive(item.label) ? '#1E4D35' : 'transparent',
              color: isActive(item.label) ? 'white' : '#333',
              fontWeight: isActive(item.label) ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.label)) {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.label)) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <main style={{
        marginLeft: '200px',
        marginTop: '60px',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#FDF6F0',
        padding: '30px',
        overflow: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
};

export default PatientLayout;
