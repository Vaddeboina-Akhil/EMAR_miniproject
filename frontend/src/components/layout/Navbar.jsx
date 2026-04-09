import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userRole }) => {
  const [isMobilMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = {
    patient: ['Dashboard', 'Medical History', 'Prescriptions', 'Profile'],
    doctor: ['Dashboard', 'Patients', 'Pending Approvals'],
    staff: ['Upload Record', 'Visit Entry']
  };

  return (
    <>
      <nav className="bg-white shadow-md border-b">
        <div className="w-full px-3 sm:px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center min-w-0">
              <Link to="/" className="text-lg sm:text-xl font-bold text-blue-600 whitespace-nowrap">EMAR</Link>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-2 sm:gap-4">
                {navLinks[userRole || 'patient'].map((item) => (
                  <Link
                    key={item}
                    to={`/${userRole}/${item.toLowerCase().replace(/ /g, '-')}`}
                    className="text-gray-700 hover:text-blue-600 px-2.5 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
                  >
                    {item}
                  </Link>
                ))}
                <button className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-red-700 font-medium min-h-[44px] min-w-[44px] transition-colors">
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobilMenuOpen)}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobilMenuOpen ? (
                  <span className="text-2xl text-gray-700">✕</span>
                ) : (
                  <span className="text-2xl text-gray-700">☰</span>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobilMenuOpen && (
        <div 
          className="fixed inset-0 top-16 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isMobile && isMobilMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-white shadow-lg z-50 max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col p-4 gap-2">
            {navLinks[userRole || 'patient'].map((item) => (
              <Link
                key={item}
                to={`/${userRole}/${item.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px] flex items-center"
              >
                {item}
              </Link>
            ))}
            <button className="bg-red-600 text-white px-4 py-3 rounded-md text-sm hover:bg-red-700 font-medium min-h-[44px] w-full transition-colors mt-4">
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
