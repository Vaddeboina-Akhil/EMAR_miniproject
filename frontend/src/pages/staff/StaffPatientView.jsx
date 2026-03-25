import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';

const StaffPatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div style={{ marginTop: '60px', backgroundColor: '#FFF5F5', padding: '28px', minHeight: 'calc(100vh - 60px)' }}>
      {/* Patient info card */}
      <div style={{ 
        backgroundColor: '#C62828', 
        borderRadius: '20px', 
        padding: '28px', 
        color: 'white',
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        marginBottom: '24px',
        maxWidth: '900px'
      }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#ccc', borderRadius: '50%' }} />
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
            Patient Name
          </div>
          <div style={{ fontSize: '15px', marginBottom: '4px' }}>
            Patient ID : 0466
          </div>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>
            Aadhaar: 1234-5678-9012
          </div>
          <div style={{ fontSize: '14px' }}>
            Age : 19
          </div>
        </div>
        <button 
          onClick={() => navigate('/staff/upload')}
          style={{
            backgroundColor: '#E53935',
            color: 'white',
            borderRadius: '50px',
            padding: '10px 24px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Upload Records
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px', 
        marginBottom: '24px',
        maxWidth: '900px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
            BLOOD GROUP
          </div>
          <div style={{ fontSize: '28px' }}>💧</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#C62828' }}>A+</div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
            ALLERGIES
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <div style={{ backgroundColor: '#FFCDD2', color: '#C62828', borderRadius: '50px', padding: '4px 12px', fontSize: '13px' }}>
              Penicillin
            </div>
            <div style={{ backgroundColor: '#FFCDD2', color: '#C62828', borderRadius: '50px', padding: '4px 12px', fontSize: '13px' }}>
              Nuts
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
            GUARDIAN CONTACT
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#C62828' }}>
            9087654321
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
            CHRONIC CONDITIONS
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <div style={{ backgroundColor: '#FFCDD2', color: '#C62828', borderRadius: '50px', padding: '4px 12px', fontSize: '13px' }}>
              Diabetes Type II
            </div>
            <div style={{ backgroundColor: '#FFCDD2', color: '#C62828', borderRadius: '50px', padding: '4px 12px', fontSize: '13px' }}>
              Hypertension
            </div>
          </div>
        </div>
      </div>

      {/* Bottom two cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px', 
        maxWidth: '900px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#C62828' }}>
            Recent Checkups
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '12px' }}>
              <span style={{ color: '#C62828', fontWeight: 'bold', marginRight: '8px' }}>●</span>
              Yashoda Hospital <strong style={{ fontWeight: 'bold' }}>/ 12-09-25</strong>
            </li>
            <li style={{ marginBottom: '12px' }}>
              <span style={{ color: '#C62828', fontWeight: 'bold', marginRight: '8px' }}>●</span>
              KIMS Hospital <strong>/ 1-08-25</strong>
            </li>
          </ul>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#C62828' }}>
            Recent Access
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '12px' }}>
              <span style={{ color: '#C62828', fontWeight: 'bold', marginRight: '8px' }}>●</span>
              Dr. Abhirama Praneeth <strong>/ 12-09-25</strong> Full access
            </li>
            <li style={{ marginBottom: '12px' }}>
              <span style={{ color: '#C62828', fontWeight: 'bold', marginRight: '8px' }}>●</span>
              Dr. Vyshnav Katamreddy <strong>/ 1-08-25</strong> Emergency
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffPatientView;

