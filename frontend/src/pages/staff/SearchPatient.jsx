import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffSearchPatient = () => {
  const [patientId, setPatientId] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (patientId) {
      navigate(`/staff/patient/${patientId}`);
    }
  };

  return (
    <div style={{ marginTop: '60px', minHeight: 'calc(100vh - 60px)', backgroundColor: '#FFF5F5', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Outer wrapper with red border */}
      <div style={{ 
        border: '6px solid #8B0000', 
        borderRadius: '24px', 
        padding: '40px', 
        backgroundColor: 'white', 
        width: '90%', 
        maxWidth: '900px'
      }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '28px', color: '#111' }}>
          Search Patient
        </div>

        {/* Pink search card */}
        <div style={{ 
          backgroundColor: '#FFCDD2', 
          borderRadius: '20px', 
          padding: '48px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '20px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#C62828' }}>
            Patient ID
          </div>
          <input 
            type="text" 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value.toUpperCase())}
            placeholder="Enter Patient ID (e.g. EMAR-P-0466)"
            style={{
              backgroundColor: 'white',
              borderRadius: '50px',
              padding: '16px 32px',
              border: 'none',
              width: '400px',
              fontSize: '18px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{
              backgroundColor: '#E53935',
              color: 'white',
              borderRadius: '50px',
              padding: '14px 48px',
              fontWeight: 'bold',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSearchPatient;

