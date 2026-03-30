import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorLayout = ({ children, activePage = 'Dashboard' }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: 'Dashboard',          icon: '🏠', path: '/doctor/overview' },
    { label: 'Search Patient',     icon: '🔍', path: '/doctor/search' },
    { label: 'My Patients',        icon: '👥', path: '/doctor/patient-management' },
    { label: 'Pending Approvals',  icon: '📋', path: '/doctor/pending-approvals' },
    { label: 'Add Prescription',   icon: '💊', path: '/doctor/add-record' },
    { label: 'Access Requests',    icon: '🔐', path: '/doctor/access-requests' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('emar_token');
    localStorage.removeItem('emar_user');
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#F0F4F8'
    }} className="doctor-scrollbar">
      {/* Navbar */}
      <div style={{
        height: '60px', backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky',
        top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontWeight: '900', fontSize: '22px', color: '#1A237E', letterSpacing: '1px' }}>
          EMAR
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            border: '1.5px solid #1A237E', borderRadius: '50px',
            padding: '6px 16px', fontSize: '13px',
            fontWeight: 'bold', color: '#1A237E',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#2ECC71', borderRadius: '50%' }} />
            Doctor Portal
          </div>
          <button onClick={handleLogout} style={{
            backgroundColor: '#1A237E', color: 'white',
            border: 'none', borderRadius: '50px',
            padding: '8px 20px', fontWeight: 'bold',
            fontSize: '13px', cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: collapsed ? '64px' : '220px',
          backgroundColor: 'white',
          borderRight: '1px solid #e0e0e0',
          padding: collapsed ? '16px 8px' : '16px',
          transition: 'width 0.25s ease',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: '60px',
          height: 'calc(100vh - 60px)', overflowY: 'auto',
          boxSizing: 'border-box'
        }}>
          {navItems.map(item => {
            const isActive = activePage === item.label;
            return (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ''}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', padding: '12px',
                  borderRadius: '10px', cursor: 'pointer',
                  marginBottom: '4px',
                  backgroundColor: isActive ? '#1A237E' : 'transparent',
                  color: isActive ? 'white' : '#444',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontSize: '14px', transition: 'all 0.15s',
                  whiteSpace: 'nowrap', overflow: 'hidden'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#E8EAF6'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            );
          })}

          {/* Collapse toggle */}
          <div style={{ marginTop: 'auto' }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                color: '#888', fontSize: '13px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{collapsed ? '→' : '←'}</span>
              {!collapsed && <span>Collapse</span>}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;