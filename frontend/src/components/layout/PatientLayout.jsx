import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PatientLayout = ({ children, activePage, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      {/* Fixed Navbar - Responsive */}
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
        padding: isMobile ? '0 12px' : '0 24px'
      }}>
        <div style={{ 
          fontSize: isMobile ? '18px' : '24px', 
          fontWeight: 'bold', 
          color: '#111',
          cursor: 'pointer'
        }}>
          EMAR
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
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
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Hamburger */}
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}
      </nav>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
        />
      )}

      {/* Fixed Sidebar - Responsive */}
      <div style={{
        position: isMobile ? 'fixed' : 'fixed',
        top: '60px',
        left: isMobile ? (sidebarOpen ? '0' : '-200px') : '0',
        width: '200px',
        height: 'calc(100vh - 60px)',
        backgroundColor: 'white',
        borderRight: '1px solid #E0E0E0',
        paddingTop: '16px',
        overflowY: 'auto',
        zIndex: isMobile ? 200 : 99,
        transition: isMobile ? 'left 0.3s ease' : 'none',
        boxShadow: isMobile && sidebarOpen ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
      }}>
        {navItems.map((item) => (
          <div
            key={item.label}
            onClick={() => {
              onNavigate ? onNavigate(item.label) : navigate(item.path);
              if (isMobile) setSidebarOpen(false);
            }}
            style={{
              padding: '12px 16px',
              margin: '4px 8px',
              fontSize: '14px',
              cursor: 'pointer',
              borderRadius: '10px',
              backgroundColor: isActive(item.label) ? '#1E4D35' : 'transparent',
              color: isActive(item.label) ? 'white' : '#333',
              fontWeight: isActive(item.label) ? 'bold' : 'normal',
              transition: 'all 0.2s ease',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center'
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

        {/* Mobile Logout Button */}
        {isMobile && (
          <div style={{ padding: '16px 8px', marginTop: 'auto', borderTop: '1px solid #E0E0E0' }}>
            <button 
              onClick={() => navigate('/')}
              style={{
                backgroundColor: '#111',
                color: 'white',
                borderRadius: '50px',
                padding: '10px 16px',
                fontWeight: 'bold',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                minHeight: '44px'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main Content - Responsive margin */}
      <main style={{
        marginLeft: isMobile ? '0' : '200px',
        marginTop: '60px',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#FDF6F0',
        padding: isMobile ? '16px' : '30px',
        overflow: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
};

export default PatientLayout;
