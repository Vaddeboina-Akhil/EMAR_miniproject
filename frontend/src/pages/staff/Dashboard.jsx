import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, doctorService } from '../../services/apiService';
import { getUser } from '../../utils/auth';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const staff = getUser();
  const [searchQuery, setSearchQuery] = useState('');

  // Log staff data for debugging
  React.useEffect(() => {
    console.log('👤 Staff data loaded:', staff);
    if (staff) {
      console.log('🏥 Hospital Name:', staff.hospitalName || 'NOT SET');
      console.log('📋 All staff fields:', Object.keys(staff));
    }
  }, [staff]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const performSearch = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    try {
      const results = await doctorService.searchPatients(query);
      setSearchResults(Array.isArray(results) ? results : []);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(searchQuery);
    }
  };

  const handleSelectPatient = (patient) => {
    navigate(`/staff/patient/${patient._id}`, { state: { patient } });
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/staff/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#FFFFFF'
    }}>
      {/* Clean Navbar */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '3px solid #DC143C',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#DC143C', letterSpacing: '1px' }}>
            EMAR
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#FF4444', borderRadius: '50%' }}></span>
            🏥 {staff?.hospitalName || 'Hospital'}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#DC143C',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#FFE6E6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Logout
        </button>
      </div>

      {/* Main Content - Centered Search */}
      <div style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        {/* Search Section */}
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 48px 0',
            textAlign: 'center'
          }}>
            Search Patient
          </h1>

          {/* Large Pink Search Card */}
          <div style={{
            backgroundColor: '#FFE8E8',
            border: '2px solid #DC143C',
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: '0 6px 24px rgba(220, 20, 60, 0.12)'
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Patient ID or Name
            </label>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                placeholder="Enter patient ID (e.g., P-001) or name... (Press Enter)"
                style={{
                  width: '100%',
                  padding: '16px 16px',
                  fontSize: '15px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.3s'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 4px 12px rgba(220,20,60,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                autoFocus
              />

              {searching && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: '#999'
                }}>
                  ⏳
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                marginTop: '12px',
                backgroundColor: 'white',
                border: '1px solid #F0F0F0',
                borderRadius: '8px',
                maxHeight: '320px',
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                {searchResults.map((patient, index) => (
                  <div
                    key={patient._id || index}
                    onClick={() => handleSelectPatient(patient)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < searchResults.length - 1 ? '1px solid #F5F5F5' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F8F8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>
                      {patient.name || patient.username || 'Unknown Patient'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
                      {patient.patientId ? `Patient ID: ${patient.patientId}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && !searching && (
              <div style={{
                marginTop: '12px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                No patients found
              </div>
            )}
          </div>

          {/* Helper Text */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#999'
          }}>
            <p style={{ margin: '0' }}>Search for a patient to view their medical records</p>
            <p style={{ margin: '4px 0 0 0' }}>and upload new medical information</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
