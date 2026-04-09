import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorLayout = ({ children, activePage = 'Dashboard' }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close sidebar when switching to desktop
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Navbar - Responsive */}
      <div style={{
        height: '60px', backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 24px',
        position: 'sticky', top: 0, zIndex: 100, 
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        {/* Logo */}
        <div style={{ 
          fontWeight: '900', 
          fontSize: isMobile ? '18px' : '22px', 
          color: '#1A237E', 
          letterSpacing: '1px',
          minWidth: 0
        }}>
          EMAR
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        {!isMobile && (
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
              fontSize: '13px', cursor: 'pointer',
              minHeight: '44px', minWidth: '44px'
            }}>
              Logout
            </button>
          </div>
        )}

        {/* Mobile Hamburger Button - Shown only on mobile */}
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{
              backgroundColor: 'transparent', border: 'none',
              fontSize: '24px', cursor: 'pointer', padding: '8px',
              minHeight: '44px', minWidth: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Mobile Overlay - Closes sidebar when clicked */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99
          }}
        />
      )}

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar - Responsive */}
        <div style={{
          width: isMobile ? '220px' : (collapsed ? '64px' : '220px'),
          backgroundColor: 'white',
          borderRight: '1px solid #e0e0e0',
          padding: collapsed && !isMobile ? '16px 8px' : '16px',
          transition: 'all 0.25s ease',
          display: 'flex', flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          left: isMobile ? (sidebarOpen ? '0' : '-220px') : '0',
          top: '60px',
          height: 'calc(100vh - 60px)', 
          overflowY: 'auto',
          boxSizing: 'border-box',
          zIndex: isMobile ? 200 : 10,
          boxShadow: isMobile && sidebarOpen ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
        }}>
          {/* Navigation Items */}
          {navItems.map(item => {
            const isActive = activePage === item.label;
            return (
              <div
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
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
                  minHeight: '44px', minWidth: '44px'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#E8EAF6'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                {!(collapsed && !isMobile) && <span>{item.label}</span>}
              </div>
            );
          })}

          {/* Collapse toggle - Hidden on mobile */}
          {!isMobile && (
            <div style={{ marginTop: 'auto' }}>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  color: '#888', fontSize: '13px', minHeight: '44px'
                }}
              >
                <span style={{ fontSize: '18px' }}>{collapsed ? '→' : '←'}</span>
                {!collapsed && <span>Collapse</span>}
              </div>
            </div>
          )}

          {/* Mobile Logout Button - Shown in sidebar on mobile only */}
          {isMobile && (
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
              <button onClick={handleLogout} style={{
                backgroundColor: '#1A237E', color: 'white',
                border: 'none', borderRadius: '50px',
                padding: '10px 16px', fontWeight: 'bold',
                fontSize: '13px', cursor: 'pointer',
                width: '100%', minHeight: '44px'
              }}>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Main content - Responsive padding */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '16px' : '32px',
          overflowY: 'auto', 
          boxSizing: 'border-box',
          width: '100%'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;