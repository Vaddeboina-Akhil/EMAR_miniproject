import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.get('/admin/logs');
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (accessType) => {
    const icons = {
      'ACCESS_REQUESTED': '🔐',
      'ACCESS_APPROVED': '✅',
      'ACCESS_DENIED': '❌',
      'RECORD_UPLOADED': '📤',
      'RECORD_APPROVED': '✔️',
      'RECORD_REJECTED': '❌',
      'DEFAULT': '📝'
    };
    return icons[accessType] || icons['DEFAULT'];
  };

  const getLogColor = (accessType) => {
    const colors = {
      'ACCESS_REQUESTED': '#3B82F6',
      'ACCESS_APPROVED': '#10B981',
      'ACCESS_DENIED': '#EF4444',
      'RECORD_UPLOADED': '#F59E0B',
      'RECORD_APPROVED': '#10B981',
      'RECORD_REJECTED': '#EF4444',
      'DEFAULT': '#8B5CF6'
    };
    return colors[accessType] || colors['DEFAULT'];
  };

  return (
    <AdminLayout title="Access Logs">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Info */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderLeft: '4px solid #8B5CF6',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
            📜 Showing all access logs in reverse chronological order (latest first)
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No logs found
            </div>
          ) : (
            <>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '30px',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: '#2a2a2a'
              }} />

              {/* Log Entries */}
              <div>
                {logs.map((log, i) => {
                  const color = getLogColor(log.accessType);
                  const icon = getLogIcon(log.accessType);
                  const date = new Date(log.timestamp);
                  
                  return (
                    <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '30px', position: 'relative' }}>
                      {/* Timeline Dot */}
                      <div style={{
                        width: '60px',
                        display: 'flex',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          border: '3px solid #0a0a0a',
                          boxShadow: `0 0 0 3px ${color}40`
                        }}>
                          {icon}
                        </div>
                      </div>

                      {/* Log Content */}
                      <div style={{
                        flex: 1,
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        padding: '20px',
                        borderLeft: `4px solid ${color}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', color: color, fontWeight: '600', fontSize: '16px' }}>
                              {log.doctorName || 'System'} accessed records
                            </h3>
                            <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
                              {log.accessType?.replace(/_/g, ' ') || 'Activity'}
                            </p>
                          </div>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: color + '20',
                            color: color,
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}>
                            {date.toLocaleTimeString()}
                          </span>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          fontSize: '13px'
                        }}>
                          <div>
                            <span style={{ color: '#888' }}>Patient ID:</span>
                            <span style={{ color: '#fff', marginLeft: '8px' }}>{log.patientId || '—'}</span>
                          </div>
                          <div>
                            <span style={{ color: '#888' }}>Hospital:</span>
                            <span style={{ color: '#fff', marginLeft: '8px' }}>{log.hospitalName || '—'}</span>
                          </div>
                          <div>
                            <span style={{ color: '#888' }}>Reason:</span>
                            <span style={{ color: '#fff', marginLeft: '8px' }}>{log.reason || '—'}</span>
                          </div>
                          <div>
                            <span style={{ color: '#888' }}>Records:</span>
                            <span style={{ color: '#fff', marginLeft: '8px' }}>{log.recordsAccessed || '—'}</span>
                          </div>
                        </div>

                        <div style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #2a2a2a',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {date.toLocaleString()} • IP: {log.ipAddress || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
