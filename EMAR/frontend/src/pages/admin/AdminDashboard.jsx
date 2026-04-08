import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/admin/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div style={{
      backgroundColor: '#1a1a1a',
      borderLeft: `4px solid ${color}`,
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '16px'
    }}>
      <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>
        {loading ? '...' : value}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Dashboard">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Main Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <StatCard title="Total Doctors" value={stats?.doctors?.total || 0} color="#3B82F6" icon="👨‍⚕️" />
          <StatCard title="Approved Doctors" value={stats?.doctors?.approved || 0} color="#10B981" icon="✅" />
          <StatCard title="Pending Doctors" value={stats?.doctors?.pending || 0} color="#F59E0B" icon="⏳" />
          <StatCard title="Blocked Doctors" value={stats?.doctors?.blocked || 0} color="#EF4444" icon="🚫" />
          
          <StatCard title="Total Patients" value={stats?.patients || 0} color="#10B981" icon="👥" />
          <StatCard title="Total Staff" value={stats?.staff || 0} color="#8B5CF6" icon="👔" />
          
          <StatCard title="Total Records" value={stats?.records?.total || 0} color="#F59E0B" icon="📋" />
          <StatCard title="Approved Records" value={stats?.records?.approved || 0} color="#10B981" icon="✔️" />
          <StatCard title="Flagged Records" value={stats?.records?.flagged || 0} color="#DC2626" icon="🚩" />
          <StatCard title="Frozen Records" value={stats?.records?.frozen || 0} color="#64748B" icon="❄️" />
        </div>

        {/* Recent Logs */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #8B5CF6' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>📜 Recent Access Logs</h2>
          {!loading && stats?.recentLogs && stats.recentLogs.length > 0 ? (
            <div>
              {stats.recentLogs.slice(0, 5).map((log, i) => (
                <div key={i} style={{
                  padding: '12px 0',
                  borderBottom: i < 4 ? '1px solid #2a2a2a' : 'none',
                  fontSize: '14px'
                }}>
                  <div style={{ color: '#3B82F6', fontWeight: '600' }}>
                    👨‍⚕️ {log.doctorName} accessed records
                  </div>
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                    Patient: {log.patientId} • {log.hospitalName || 'N/A'} • {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#666', textAlign: 'center', padding: '40px 0' }}>
              No recent logs
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
