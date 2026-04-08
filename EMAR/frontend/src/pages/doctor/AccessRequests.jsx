import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const DoctorAccessRequests = () => {
  const navigate = useNavigate();
  const doctor = getUser();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, denied

  useEffect(() => {
    fetchAccessRequests();
  }, []);

  const fetchAccessRequests = async () => {
    try {
      const doctorId = doctor?._id || doctor?.id;
      const data = await api.get(`/consent/doctor/${doctorId}`);
      setConsents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredConsents = () => {
    if (filter === 'all') return consents;
    return consents.filter(c => c.status === filter);
  };

  const statusColors = {
    pending: { bg: '#FFF8E1', text: '#F39C12', border: '#FFE082' },
    approved: { bg: '#E8F5E9', text: '#27AE60', border: '#C8E6C9' },
    denied: { bg: '#FFEBEE', text: '#E74C3C', border: '#FFCDD2' }
  };

  const statusIcons = {
    pending: '⏳',
    approved: '✅',
    denied: '❌'
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filtered = getFilteredConsents();

  return (
    <DoctorLayout activePage="Access Requests">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#1A237E', borderRadius: '16px',
          padding: '28px', color: 'white', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              🔐 Access Requests
            </div>
            <div style={{ fontSize: '14px', opacity: 0.85 }}>
              Manage access requests you've sent to patients
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '12px', padding: '12px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900' }}>{consents.length}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Total Requests</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'denied'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '8px 20px', borderRadius: '50px',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold',
                backgroundColor: filter === tab ? '#1A237E' : 'white',
                color: filter === tab ? 'white' : '#666',
                boxShadow: filter === tab ? '0 2px 8px rgba(26, 35, 126, 0.2)' : '0 1px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            Loading access requests...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              No {filter !== 'all' ? filter : ''} requests
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
              {filter === 'all' 
                ? 'You haven\'t sent any access requests yet'
                : `No ${filter} requests at this time`}
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((consent, i) => {
              const colors = statusColors[consent.status] || statusColors.pending;
              return (
                <div key={consent._id || i} style={{
                  backgroundColor: 'white', borderRadius: '16px',
                  padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: `1.5px solid ${colors.border}`
                }}>
                  {/* Request Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        backgroundColor: colors.bg, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '22px'
                      }}>
                        {statusIcons[consent.status]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#111' }}>
                          {typeof consent.patientId === 'object' ? consent.patientId?.name : consent.patientName || 'Unknown Patient'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                          Requested: {formatDate(consent.requestDate)}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      backgroundColor: colors.bg, color: colors.text,
                      borderRadius: '50px', padding: '4px 14px',
                      fontSize: '12px', fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {consent.status}
                    </span>
                  </div>

                  {/* Request Details */}
                  <div style={{
                    backgroundColor: '#F9FAFB', borderRadius: '12px',
                    padding: '16px', marginBottom: '16px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Patient ID
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                        {typeof consent.patientId === 'object' ? consent.patientId?.patientId : consent.patientId || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Hospital
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                        {consent.hospitalName || '—'}
                      </div>
                    </div>
                    {consent.reason && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Reason for Access
                        </div>
                        <div style={{ fontSize: '14px', color: '#555' }}>
                          {consent.reason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Response Info */}
                  {consent.responseDate && (
                    <div style={{
                      backgroundColor: colors.bg, borderRadius: '12px',
                      padding: '12px 16px', fontSize: '13px', color: colors.text
                    }}>
                      <strong>Response Date:</strong> {formatDate(consent.responseDate)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorAccessRequests;
