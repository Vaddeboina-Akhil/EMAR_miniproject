import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [action, setAction] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await api.get('/admin/doctors');
      setDoctors(data.doctors || []);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (doctorId, actionType) => {
    try {
      if (actionType === 'approve') {
        await api.put(`/admin/doctors/${doctorId}/approve`);
      } else if (actionType === 'reject') {
        await api.put(`/admin/doctors/${doctorId}/reject`, { reason: 'Rejected by admin' });
      } else if (actionType === 'block') {
        await api.put(`/admin/doctors/${doctorId}/block`, { reason: 'Blocked by admin' });
      }
      fetchDoctors();
      setSelectedDoctor(null);
      setAction(null);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444',
      blocked: '#DC2626'
    };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        backgroundColor: colors[status] || '#666',
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout title={`Doctors (${doctors.length})`}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #3B82F6', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Total</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B82F6' }}>{stats?.total || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #10B981', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Approved</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>{stats?.approved || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #F59E0B', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Pending</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F59E0B' }}>{stats?.pending || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #EF4444', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Blocked</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#EF4444' }}>{stats?.blocked || 0}</div>
          </div>
        </div>

        {/* Doctors Table */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #3B82F6', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>👨‍⚕️ Doctors List</h2>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>
          ) : doctors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No doctors found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>License</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Specialization</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Hospital</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc._id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                      <td style={{ padding: '16px', color: '#fff' }}>{doc.name}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{doc.licenseId}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{doc.specialization || '—'}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{doc.hospitalName || '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <StatusBadge status={doc.status} />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {doc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(doc._id, 'approve')}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#10B981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleAction(doc._id, 'reject')}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#EF4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {doc.status !== 'blocked' && doc.status !== 'rejected' && (
                            <button
                              onClick={() => handleAction(doc._id, 'block')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#DC2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              🚫 Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDoctors;
