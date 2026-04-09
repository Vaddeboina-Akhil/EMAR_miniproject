import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser, getRole } from '../../utils/auth';
import { recordService } from '../../services/recordService';
import { api } from '../../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userRole = getRole();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 🔐 Validate that the logged-in user is actually a doctor
  if (!user || !userRole || userRole !== 'doctor') {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '40px',
          textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Access Denied</h2>
          <p style={{ color: '#666', margin: '0 0 24px 0' }}>
            You must log in as a doctor to access this page
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('emar_user');
              localStorage.removeItem('emar_token');
              navigate('/login');
            }}
            style={{
              backgroundColor: '#1A237E', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 24px', fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const [stats, setStats] = useState({ pendingRecords: 0, totalPatients: 0, accessRequests: 0 });
  const [pendingRecords, setPendingRecords] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchStats();
    }
  }, [user?._id]);

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      // 1. Fetch combined dashboard stats (all counts)
      let statsData = { accessRequests: 0, myPatients: 0, pendingApprovals: 0 };
      try {
        statsData = await api.get('/doctors/dashboard-stats');
      } catch (e) {
        console.warn('Failed to fetch dashboard stats:', e.message);
      }

      // 2. Fetch Pending Records for preview
      let pendingRecordsData = [];
      try {
        const pendingRes = await api.get('/doctors/pending-records');
        pendingRecordsData = Array.isArray(pendingRes?.records) ? pendingRes.records : [];
        setPendingRecords(pendingRecordsData.slice(0, 3));
      } catch (e) {
        console.warn('Failed to fetch pending records:', e.message);
        setPendingRecords([]);
      }

      // 3. Fetch Recent Activity with proper patient names
      let activitiesData = [];
      try {
        const activityRes = await api.get('/doctors/recent-activity');
        activitiesData = Array.isArray(activityRes?.activities) ? activityRes.activities : [];
      } catch (e) {
        console.warn('Failed to fetch recent activity:', e.message);
      }

      // Update stats
      setStats({
        pendingRecords: statsData.pendingApprovals || 0,
        totalPatients: statsData.myPatients || 0,
        accessRequests: statsData.accessRequests || 0,
      });

      // Format activity data for display
      const displayActivity = activitiesData.length > 0
        ? activitiesData.slice(0, 4).map(a => ({
          icon: a.icon || '📝',
          text: a.action,
          time: formatRelativeTime(a.timestamp),
        }))
        : [{ icon: '✅', text: 'No recent activity yet', time: '' }];

      setRecentActivity(displayActivity);

    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const styles = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#111',
  };

  // ─── Doctor Profile Card ──────────────────────────────────────────────────
  const ProfileCard = () => (
    <div style={{
      backgroundColor: '#1A237E',
      borderRadius: '20px',
      padding: isMobile ? '20px 16px' : '28px 32px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '16px' : '28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '120px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />

      {/* Avatar */}
      <div style={{ 
        width: isMobile ? '80px' : '100px', 
        height: isMobile ? '80px' : '100px', 
        borderRadius: '50%', 
        border: '3px solid rgba(255,255,255,0.4)', 
        overflow: 'hidden', 
        flexShrink: 0, 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: isMobile ? '32px' : '40px', 
        fontWeight: 'bold',
        minWidth: isMobile ? '80px' : '100px',
        minHeight: isMobile ? '80px' : '100px'
      }}>
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          user?.name ? user.name.charAt(0).toUpperCase() : '?'
        )}
      </div>

      {/* Info Section */}
      <div style={{ flex: 1, color: 'white' }}>
        <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '900', marginBottom: '6px' }}>{user?.name || 'Doctor Name'}</div>
        <div style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.85, marginBottom: '4px', fontWeight: '600' }}>License ID: &nbsp;<span style={{ opacity: 1 }}>{user?.licenseId || 'MED—'}</span></div>
        <div style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.85, marginBottom: '4px', fontWeight: '600' }}>Specialization: &nbsp;<span style={{ opacity: 1 }}>{user?.specialization || '—'}</span></div>
        <div style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.85, marginBottom: '4px', fontWeight: '600' }}>Age: &nbsp;<span style={{ opacity: 1 }}>{user?.age || '—'}</span></div>
        <div style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.85, fontWeight: '600' }}>Hospital: &nbsp;<span style={{ opacity: 1 }}>{user?.hospitalName || '—'}</span></div>
      </div>

      {/* Status Badge */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        backgroundColor: 'white', 
        borderRadius: '50px', 
        padding: '8px 16px', 
        alignSelf: isMobile ? 'flex-start' : 'flex-start',
        position: isMobile ? 'relative' : 'static',
        zIndex: 10,
        minHeight: '44px'
      }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2ECC71', boxShadow: '0 0 0 3px rgba(46,204,113,0.25)' }} />
        <span style={{ fontWeight: 'bold', color: '#111', fontSize: '12px' }}>ACTIVE</span>
      </div>

      {/* Verified Badge */}
      <div style={{ 
        position: isMobile ? 'relative' : 'absolute', 
        bottom: isMobile ? 'auto' : '20px', 
        right: isMobile ? 'auto' : '28px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        zIndex: 10,
        marginTop: isMobile ? '8px' : '0'
      }}>
        <div style={{ width: '32px', height: '32px', background: 'radial-gradient(circle, #A8E063 0%, #56AB2F 100%)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
          ✔
        </div>
        <div>
          <div style={{ fontWeight: 'bold', color: 'white', fontSize: isMobile ? '11px' : '13px' }}>Verified Doctor</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: isMobile ? '9px' : '11px' }}>License &amp; Authenticated</div>
        </div>
      </div>
    </div>
  );

  // ─── Stats Row ────────────────────────────────────────────────────────────
  const StatsRow = () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? '12px' : '16px', 
      marginBottom: '24px' 
    }}>
      {[
        { icon: '📋', label: 'Pending Approvals', value: stats.pendingRecords, color: '#F39C12', path: '/doctor/pending-approvals' },
        { icon: '👥', label: 'My Patients', value: stats.totalPatients, color: '#2979FF', path: '/doctor/patient-management' },
        { icon: '🔐', label: 'Access Requests', value: stats.accessRequests, color: '#9C27B0', path: '/doctor/access-requests' },
        { icon: '💊', label: 'Add Prescription', value: 'Go →', color: '#2ECC71', path: '/doctor/add-record' },
      ].map((s, i) => (
        <div
          key={i}
          onClick={() => s.path && navigate(s.path)}
          style={{ 
            backgroundColor: 'white', borderRadius: '16px', 
            padding: isMobile ? '16px' : '20px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)', 
            borderLeft: `4px solid ${s.color}`, 
            cursor: s.path ? 'pointer' : 'default', 
            transition: 'transform 0.15s, box-shadow 0.15s',
            minHeight: isMobile ? '100px' : '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
          onMouseEnter={e => { if (s.path) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; }}
        >
          <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>{s.icon}</div>
          <div style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: '900', color: s.color, marginBottom: '4px' }}>{loading ? '—' : s.value}</div>
          <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666', fontWeight: '600' }}>{isMobile ? s.label.split(' ')[0] : s.label}</div>
        </div>
      ))}
    </div>
  );

  // ─── Pending Records Preview ───────────────────────────────────────────────
  const PendingSection = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '0', marginBottom: '16px' }}>
        <span style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 'bold' }}>📋 Pending Record Approvals</span>
        <button onClick={() => navigate('/doctor/pending-approvals')} style={{ backgroundColor: '#E8EAF6', color: '#1A237E', border: 'none', borderRadius: '50px', padding: '6px 16px', fontSize: isMobile ? '12px' : '13px', fontWeight: 'bold', cursor: 'pointer', minHeight: '44px' }}>View All</button>
      </div>
      {loading && <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>}
      {!loading && pendingRecords.length === 0 && (
        <div style={{ textAlign: 'center', padding: '28px', color: '#999' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: isMobile ? '13px' : '14px' }}>No pending records — you're all caught up!</div>
        </div>
      )}
      {!loading && pendingRecords.map((rec, i) => (
        <div key={rec._id || i} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '0', padding: '14px 16px', backgroundColor: '#FAFAFA', borderRadius: '12px', marginBottom: '8px', border: '1px solid #f0f0f0' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '15px', wordBreak: 'break-word' }}>{rec.patientName || 'Unknown Patient'}</div>
            <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#666' }}>{rec.recordType} · {rec.hospitalName || '—'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ backgroundColor: '#FFF8E1', color: '#F39C12', borderRadius: '50px', padding: '3px 12px', fontSize: '12px', fontWeight: 'bold' }}>PENDING</span>
            <button onClick={() => navigate('/doctor/pending-approvals')} style={{ backgroundColor: '#1A237E', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', flex: isMobile ? 1 : 'none', minHeight: '44px' }}>Review</button>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Recent Activity ───────────────────────────────────────────────────────
  const ActivitySection = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 'bold', marginBottom: '16px' }}>🕐 Recent Activity</div>
      {loading && <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>}
      {!loading && recentActivity.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: isMobile ? '10px 0' : '12px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, minWidth: '36px', minHeight: '36px' }}>{a.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#111', wordBreak: 'break-word' }}>{a.text}</div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#999' }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Quick Actions Grid ────────────────────────────────────────────────────
  const QuickActions = () => (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '12px' : '16px', marginBottom: '24px' }}>
      {[
        { icon: '🔍', label: 'Search Patient', sub: 'By EMAR ID, Name, Aadhaar', path: '/doctor/search', color: '#2979FF' },
        { icon: '📋', label: 'Approve Records', sub: 'Review staff-uploaded records', path: '/doctor/pending-approvals', color: '#F39C12' },
        { icon: '💊', label: 'Add Prescription', sub: 'Write & save prescription', path: '/doctor/add-record', color: '#2ECC71' },
        { icon: '👥', label: 'My Patients', sub: 'View treated patients list', path: '/doctor/patient-management', color: '#9C27B0' },
      ].map(a => (
        <div
          key={a.path}
          onClick={() => navigate(a.path)}
          style={{ backgroundColor: 'white', borderRadius: isMobile ? '12px' : '16px', padding: isMobile ? '16px' : '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', border: `1.5px solid ${a.color}22`, transition: 'all 0.15s', minHeight: '80px' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${a.color}0d`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ width: isMobile ? '40px' : '50px', height: isMobile ? '40px' : '50px', borderRadius: '14px', backgroundColor: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '20px' : '24px', flexShrink: 0 }}>{a.icon}</div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#111', fontSize: isMobile ? '13px' : '15px', marginBottom: '3px' }}>{a.label}</div>
            <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#888' }}>{a.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <DoctorLayout activePage="Dashboard">
      <div style={styles}>
        <ProfileCard />
        <StatsRow />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <PendingSection />
          <ActivitySection />
        </div>
        <QuickActions />
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;