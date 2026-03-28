import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState({ pendingRecords: 0, totalPatients: 0, accessRequests: 0 });
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const doctorId = user?._id || user?.id;
      // Fetch pending records for this doctor's hospital
      const records = await api.get(`/records/pending/${doctorId}`);
      const pending = Array.isArray(records) ? records : [];
      setPendingRecords(pending.slice(0, 3)); // show latest 3
      setStats(prev => ({ ...prev, pendingRecords: pending.length }));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCard = (icon, label, value, color, onClick) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white', borderRadius: '16px', padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.15s, box-shadow 0.15s'
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '36px', fontWeight: '900', color, marginBottom: '4px' }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{label}</div>
    </div>
  );

  return (
    <DoctorLayout activePage="Dashboard">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Welcome Card */}
        <div style={{
          backgroundColor: '#1A237E', borderRadius: '20px',
          padding: '28px', color: 'white', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '6px' }}>
              Welcome, {user?.name || 'Doctor'} 👨‍⚕️
            </div>
            <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '4px' }}>
              {user?.specialization || 'Specialist'} · {user?.hospitalName || 'Hospital'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>
              License ID: {user?.licenseId || '—'} · Doctor ID: {user?.doctorId || '—'}
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '16px', padding: '16px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900' }}>{stats.pendingRecords}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Pending Approvals</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px', marginBottom: '28px'
        }}>
          {statCard('📋', 'Pending Record Approvals', stats.pendingRecords, '#F39C12',
            () => navigate('/doctor/pending-approvals'))}
          {statCard('🔍', 'Search Patient', 'Go →', '#2979FF',
            () => navigate('/doctor/search'))}
          {statCard('💊', 'Add Prescription', 'Go →', '#2ECC71',
            () => navigate('/doctor/add-record'))}
        </div>

        {/* Pending Records Preview */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111' }}>
              📋 Pending Record Approvals
            </div>
            <button
              onClick={() => navigate('/doctor/pending-approvals')}
              style={{
                backgroundColor: '#E8EAF6', color: '#1A237E',
                border: 'none', borderRadius: '50px',
                padding: '6px 16px', fontSize: '13px',
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              View All
            </button>
          </div>

          {loading && <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>}
          {!loading && pendingRecords.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div>No pending records — you're all caught up!</div>
            </div>
          )}
          {!loading && pendingRecords.map((rec, i) => (
            <div key={rec._id || i} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '14px 16px',
              backgroundColor: '#FAFAFA', borderRadius: '12px',
              marginBottom: '8px', border: '1px solid #f0f0f0'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#111' }}>
                  {rec.patientName || 'Unknown Patient'}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {rec.recordType} · {rec.hospitalName || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  backgroundColor: '#FFF8E1', color: '#F39C12',
                  borderRadius: '50px', padding: '3px 12px',
                  fontSize: '12px', fontWeight: 'bold'
                }}>
                  PENDING
                </span>
                <button
                  onClick={() => navigate('/doctor/pending-approvals')}
                  style={{
                    backgroundColor: '#1A237E', color: 'white',
                    border: 'none', borderRadius: '8px',
                    padding: '6px 14px', fontSize: '12px',
                    fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'
        }}>
          {[
            { icon: '🔍', label: 'Search Patient by EMAR ID', path: '/doctor/search', color: '#2979FF' },
            { icon: '📋', label: 'Approve Pending Records', path: '/doctor/pending-approvals', color: '#F39C12' },
            { icon: '💊', label: 'Add Prescription', path: '/doctor/add-record', color: '#2ECC71' },
            { icon: '👥', label: 'My Patients', path: '/doctor/patient-management', color: '#9C27B0' },
          ].map(action => (
            <div
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                backgroundColor: 'white', borderRadius: '14px',
                padding: '20px', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: '14px',
                border: `1.5px solid ${action.color}22`,
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${action.color}11`; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: `${action.color}22`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '22px', flexShrink: 0
              }}>
                {action.icon}
              </div>
              <div style={{ fontWeight: 'bold', color: '#111', fontSize: '15px' }}>
                {action.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;