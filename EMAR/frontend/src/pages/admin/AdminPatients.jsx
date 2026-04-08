import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await api.get('/admin/patients');
      setPatients(data.patients || []);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (patientId) => {
    try {
      await api.put(`/admin/patients/${patientId}/block`, { reason: 'Blocked by admin' });
      fetchPatients();
    } catch (err) {
      console.error('Failed to block patient:', err);
    }
  };

  return (
    <AdminLayout title={`Patients (${patients.length})`}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #10B981', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Total Patients</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>{stats?.total || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #EF4444', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Blocked</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#EF4444' }}>{stats?.blocked || 0}</div>
          </div>
        </div>

        {/* Patients Table */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #10B981', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>👥 Patients List</h2>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>
          ) : patients.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No patients found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Patient ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Age</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>{patient.name}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{patient.email}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{patient.patientId || '—'}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{patient.age || '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: patient.status === 'blocked' ? '#DC2626' : '#10B981',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {patient.status === 'blocked' ? '🚫 Blocked' : '✓ Active'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {patient.status !== 'blocked' && (
                          <button
                            onClick={() => handleBlock(patient._id)}
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
                            Block
                          </button>
                        )}
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

export default AdminPatients;
