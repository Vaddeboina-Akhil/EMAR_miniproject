import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', hospital: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await api.get('/admin/staff');
      setStaff(data.staff || []);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/staff', formData);
      fetchStaff();
      setFormData({ name: '', email: '', password: '', hospital: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create staff:', err);
    }
  };

  const handleBlock = async (staffId) => {
    try {
      await api.put(`/admin/staff/${staffId}/block`, { reason: 'Blocked by admin' });
      fetchStaff();
    } catch (err) {
      console.error('Failed to block staff:', err);
    }
  };

  return (
    <AdminLayout title={`Staff (${staff.length})`}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #8B5CF6', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Total Staff</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B5CF6' }}>{stats?.total || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #EF4444', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Blocked</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#EF4444' }}>{stats?.blocked || 0}</div>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '24px', marginBottom: '30px', borderLeft: '4px solid #8B5CF6' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>➕ Create New Staff Account</h2>
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder="Hospital Name"
                value={formData.hospital}
                onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                required
                style={{
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Create Staff
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Table */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #8B5CF6', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>👔 Staff List</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              ➕ Add Staff
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>
          ) : staff.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No staff found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Email</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Staff ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Hospital</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>{s.name}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{s.email}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{s.staffId}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{s.hospitalName || '—'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: s.status === 'blocked' ? '#DC2626' : '#10B981',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {s.status === 'blocked' ? '🚫 Blocked' : '✓ Active'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {s.status !== 'blocked' && (
                          <button
                            onClick={() => handleBlock(s._id)}
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

export default AdminStaff;
