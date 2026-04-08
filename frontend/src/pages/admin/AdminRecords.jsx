import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminRecords = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);
  const [freezing, setFreezing] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [showFreezeReason, setShowFreezeReason] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchSystemStatus();
    // Poll system status every 15 seconds
    const interval = setInterval(fetchSystemStatus, 15000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchRecords = async () => {
    try {
      const url = filter ? `/admin/records?status=${filter}` : '/admin/records';
      const data = await api.get(url);
      setRecords(data.records || []);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const data = await api.get('/admin/system/status');
      setSystemStatus(data);
    } catch (err) {
      console.error('Failed to fetch system status:', err);
    }
  };

  const handleSystemFreeze = async () => {
    if (!freezeReason.trim()) {
      alert('Please provide a reason for freezing the system');
      return;
    }
    
    setFreezing(true);
    try {
      await api.post('/admin/system/freeze', { reason: freezeReason });
      setFreezeReason('');
      setShowFreezeReason(false);
      await fetchSystemStatus();
      fetchRecords();
    } catch (err) {
      console.error('Failed to freeze system:', err);
      alert('Failed to freeze system: ' + err.message);
    } finally {
      setFreezing(false);
    }
  };

  const handleSystemUnfreeze = async () => {
    if (!window.confirm('Are you sure you want to unfreeze the system? Record uploads will resume.')) {
      return;
    }

    setFreezing(true);
    try {
      await api.post('/admin/system/unfreeze');
      await fetchSystemStatus();
      fetchRecords();
    } catch (err) {
      console.error('Failed to unfreeze system:', err);
      alert('Failed to unfreeze system: ' + err.message);
    } finally {
      setFreezing(false);
    }
  };

  const handleViewPDF = (record) => {
    if (!record.fileUrl) {
      alert('No PDF file available for this record');
      return;
    }
    window.open(record.fileUrl, '_blank');
  };

  const StatusBadge = ({ status, isFrozen, isFlagged, isTampered }) => {
    let colors = {
      draft: '#64748B',
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444'
    };
    
    if (isFrozen) return <span style={statusStyle('#1F2937')}>❄️ Frozen</span>;
    if (isTampered) return <span style={statusStyle('#DC2626')}>⚠️ Tampered</span>;
    if (isFlagged) return <span style={statusStyle('#F97316')}>🚩 Flagged</span>;
    
    return (
      <span style={statusStyle(colors[status] || '#666')}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const statusStyle = (bgColor) => ({
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: bgColor,
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  });

  return (
    <AdminLayout title={`Records (${records.length})`}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* System Status Alert */}
        {systemStatus?.isFrozen && (
          <div style={{
            backgroundColor: '#7F1D1D',
            borderLeft: '4px solid #DC2626',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#FCA5A5'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#FEE2E2' }}>
              🔒 System Frozen by Admin
            </div>
            <div style={{ fontSize: '14px' }}>
              Reason: {systemStatus.reason || 'No reason provided'}
            </div>
            {systemStatus.frozenAt && (
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#FECACA' }}>
                Frozen at: {new Date(systemStatus.frozenAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Global Freeze Control Bar */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderLeft: '4px solid ' + (systemStatus?.isFrozen ? '#10B981' : '#DC2626'),
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                🔐 System Freeze Controls
              </h3>
              <p style={{ margin: '0', fontSize: '13px', color: '#888' }}>
                {systemStatus?.isFrozen 
                  ? '❄️ System is currently FROZEN - record uploads are disabled' 
                  : '✅ System is ACTIVE - record uploads are enabled'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {systemStatus?.isFrozen ? (
                <button
                  onClick={handleSystemUnfreeze}
                  disabled={freezing}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: freezing ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    opacity: freezing ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {freezing ? 'Processing...' : '🔓 Unfreeze System'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowFreezeReason(!showFreezeReason)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#DC2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {showFreezeReason ? '✕ Cancel' : '🔒 Freeze System'}
                  </button>
                  {showFreezeReason && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <textarea
                        value={freezeReason}
                        onChange={(e) => setFreezeReason(e.target.value)}
                        placeholder="Enter reason for freezing..."
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#222',
                          color: '#fff',
                          border: '1px solid #444',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          minWidth: '250px',
                          minHeight: '60px',
                          resize: 'vertical'
                        }}
                      />
                      <button
                        onClick={handleSystemFreeze}
                        disabled={freezing || !freezeReason.trim()}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#DC2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: (freezing || !freezeReason.trim()) ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          opacity: (freezing || !freezeReason.trim()) ? 0.5 : 1,
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {freezing ? 'Freezing...' : 'Confirm'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #F59E0B', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Total</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F59E0B' }}>{stats?.total || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #10B981', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Approved</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>{stats?.approved || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #DC2626', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Flagged</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#DC2626' }}>{stats?.flagged || 0}</div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', borderLeft: '4px solid #64748B', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Frozen Records</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#64748B' }}>{stats?.frozen || 0}</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '30px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['', 'draft', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === status ? '#3B82F6' : '#2a2a2a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {/* Records Table */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #F59E0B', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #2a2a2a' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>📋 Medical Records - Full Details</h2>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading...</div>
          ) : records.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No records found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111111', borderBottom: '1px solid #2a2a2a' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Patient</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>EMAR ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Type</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Hospital</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Uploaded By</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Approved By</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#888' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec._id} style={{ 
                      borderBottom: '1px solid #2a2a2a',
                      backgroundColor: rec.isFrozen ? 'rgba(31, 41, 55, 0.3)' : 'transparent',
                      opacity: rec.isFrozen ? 0.8 : 1
                    }}>
                      <td style={{ padding: '16px', color: '#fff', fontWeight: '600' }}>
                        {rec.patientName || 'Unknown'}
                        {rec.isFrozen && <span style={{ color: '#64748B', marginLeft: '8px' }}>❄️</span>}
                        {rec.isTampered && <span style={{ color: '#DC2626', marginLeft: '4px' }}>⚠️</span>}
                        {rec.isFlagged && <span style={{ color: '#F97316', marginLeft: '4px' }}>🚩</span>}
                      </td>
                      <td style={{ padding: '16px', color: '#999', fontSize: '12px' }}>
                        {rec.patientId || '—'}
                      </td>
                      <td style={{ padding: '16px', color: '#999' }}>{rec.recordType || '—'}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{rec.hospital || '—'}</td>
                      <td style={{ padding: '16px', color: '#999' }}>{rec.uploadedBy || '—'}</td>
                      <td style={{ padding: '16px', color: '#999' }}>
                        {rec.approvedBy ? (
                          <>
                            {rec.approvedBy}
                            {rec.approvedByEmail && (
                              <div style={{ fontSize: '11px', color: '#666' }}>{rec.approvedByEmail}</div>
                            )}
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <StatusBadge 
                          status={rec.status} 
                          isFrozen={rec.isFrozen}
                          isFlagged={rec.isFlagged}
                          isTampered={rec.isTampered}
                        />
                      </td>
                      <td style={{ padding: '16px', color: '#999', fontSize: '12px' }}>
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => handleViewPDF(rec)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          title={rec.fileName ? `${rec.fileName} (${rec.fileSize ? (rec.fileSize / 1024).toFixed(2) : '?'} KB)` : 'No file'}
                        >
                          📄 View PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Footer */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#888'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Legend:</strong> ❄️ = Frozen Record | ⚠️ = Tampered/Blockchain Issue | 🚩 = Flagged by Admin
          </div>
          <div>
            <strong>System Status:</strong> {systemStatus?.isFrozen ? '🔴 FROZEN' : '🟢 ACTIVE'} 
            {systemStatus?.isFrozen && systemStatus?.frozenAt && 
              ` • Frozen for ${Math.round((Date.now() - new Date(systemStatus.frozenAt).getTime()) / 1000 / 60)} minutes`
            }
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRecords;
