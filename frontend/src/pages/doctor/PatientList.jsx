import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { api } from '../../services/api';

const SearchPatient = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const data = await api.get(`/patient/search?q=${encodeURIComponent(query.trim())}`);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <DoctorLayout activePage="Search Patient">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header - Responsive padding & font size */}
        <div style={{
          backgroundColor: '#1A237E', borderRadius: '16px',
          padding: isMobile ? '20px 16px' : '28px', 
          color: 'white', marginBottom: '24px'
        }}>
          <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            🔍 Search Patient
          </div>
          <div style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.85 }}>
            Find patients by EMAR ID, name, or Aadhaar ID
          </div>
        </div>

        {/* Search Box - Responsive layout */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: isMobile ? '16px' : '24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <form onSubmit={handleSearch} style={{ 
            display: 'flex', 
            gap: '12px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isMobile ? "Enter EMAR ID or name..." : "Enter EMAR ID (e.g. EMAR-P-1023), Patient Name, or Aadhaar ID..."}
              style={{
                flex: 1, padding: '14px 22px', borderRadius: '50px',
                border: '1.5px solid #ddd', fontSize: '15px',
                outline: 'none', boxSizing: 'border-box',
                minHeight: '44px'
              }}
              onFocus={e => e.target.style.borderColor = '#1A237E'}
              onBlur={e => e.target.style.borderColor = '#ddd'}
            />
            <button type="submit" style={{
              backgroundColor: '#1A237E', color: 'white',
              border: 'none', borderRadius: '50px',
              padding: isMobile ? '12px 16px' : '14px 32px', 
              fontSize: isMobile ? '14px' : '15px',
              fontWeight: 'bold', cursor: 'pointer', 
              whiteSpace: 'nowrap',
              minHeight: '44px',
              width: isMobile ? '100%' : 'auto'
            }}>
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </form>

          <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
            Tip: Search by EMAR ID for best results
          </div>
        </div>

        {/* Results */}
        {searched && (
          <>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
              {results.length > 0 ? `${results.length} patient(s) found` : 'No patients found'}
            </div>

            {results.length === 0 && (
              <div style={{
                textAlign: 'center', padding: isMobile ? '40px 16px' : '60px 20px',
                backgroundColor: 'white', borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: isMobile ? '36px' : '48px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#333' }}>
                  No patients found
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#999', marginTop: '4px' }}>
                  Try searching with a different EMAR ID or name
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map((patient, i) => (
                <div key={patient._id || i} style={{
                  backgroundColor: 'white', borderRadius: '16px',
                  padding: isMobile ? '12px' : '20px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? '12px' : '16px'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    backgroundColor: '#E8EAF6', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', fontWeight: 'bold', color: '#1A237E',
                    overflow: 'hidden',
                    minWidth: '56px', minHeight: '56px'
                  }}>
                    {patient.profileImage
                      ? <img src={patient.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (patient.name?.charAt(0).toUpperCase() || '?')}
                  </div>

                  {/* Info - Responsive text sizes */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '17px', color: '#111', marginBottom: '4px', wordBreak: 'break-word' }}>
                      {patient.name}
                    </div>
                    <div style={{ fontSize: isMobile ? '11px' : '13px', color: '#666', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'pre-wrap' : 'nowrap' }}>
                      EMAR ID: {patient.patientId || '—'} · Age: {patient.age || '—'}
                    </div>
                    <div style={{ fontSize: isMobile ? '11px' : '13px', color: '#999' }}>
                      Aadhaar: {patient.aadhaarId?.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3') || '—'}
                    </div>
                  </div>

                  {/* Action Button - Full width on mobile */}
                  <button
                    onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                    style={{
                      backgroundColor: '#1A237E', color: 'white',
                      border: 'none', borderRadius: '50px',
                      padding: isMobile ? '10px 16px' : '10px 24px', 
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: 'bold', cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      minHeight: '44px'
                    }}
                  >
                    {isMobile ? 'View' : 'View Patient'} →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Before search — hint */}
        {!searched && !loading && (
          <div style={{
            textAlign: 'center', padding: isMobile ? '40px 16px' : '60px 20px',
            backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: isMobile ? '36px' : '48px', marginBottom: '12px' }}>🏥</div>
            <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#333' }}>
              Search for a patient to get started
            </div>
            <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#999', marginTop: '4px' }}>
              Enter EMAR ID, patient name, or Aadhaar ID above
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default SearchPatient;