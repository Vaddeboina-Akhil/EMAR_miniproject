import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { recordService } from '../../services/recordService';
import { api } from '../../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
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
      const doctorId = user?._id;

      // 1. Pending records (staff-uploaded, awaiting doctor approval)
      const pending = await recordService.getPendingRecords(doctorId);
      setPendingRecords(Array.isArray(pending) ? pending.slice(0, 3) : []);

      // 2. Records added BY this doctor → derive unique patient count
      let doctorRecords = [];
      let myPatientIds = new Set();
      try {
        const drRes = await recordService.getDoctorRecords(doctorId);
        doctorRecords = Array.isArray(drRes) ? drRes : [];
        doctorRecords.forEach(r => {
          const pid = r.patientId?._id || r.patientId;
          if (pid) myPatientIds.add(String(pid));
        });
      } catch (e) {
        console.warn('Doctor records endpoint:', e.message);
      }

      // 3. Access requests sent by this doctor
      let consents = [];
      try {
        const consentRes = await api.get(`/consent/doctor/${doctorId}`);
        consents = Array.isArray(consentRes) ? consentRes : [];
      } catch (e) {
        console.warn('Doctor consents endpoint not ready:', e.message);
      }

      // 4. Build recent activity from real data
      const activity = [];

      consents
        .filter(c => c.status === 'approved')
        .slice(0, 2)
        .forEach(c => {
          activity.push({
            icon: '🔓',
            text: `Access granted by ${c.patientName || 'a patient'}`,
            time: formatRelativeTime(c.updatedAt || c.createdAt),
          });
        });

      doctorRecords.slice(0, 2).forEach(r => {
        activity.push({
          icon: '💊',
          text: `Prescription added for ${r.patientName || 'a patient'}`,
          time: formatRelativeTime(r.createdAt),
        });
      });

      if (pending.length > 0) {
        activity.push({
          icon: '📋',
          text: `${pending.length} record${pending.length > 1 ? 's' : ''} awaiting your approval`,
          time: 'Now',
        });
      }

      setStats({
        pendingRecords: pending.length,
        totalPatients: myPatientIds.size,
        accessRequests: consents.length,
      });

      setRecentActivity(
        activity.length > 0
          ? activity.slice(0, 4)
          : [{ icon: '✅', text: 'No recent activity yet', time: '' }]
      );

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
      padding: '28px 32px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '120px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }} />

      <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {user?.profileImage
          ? <img src={user.profileImage} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '40px' }}>👨‍⚕️</span>
        }
      </div>

      <div style={{ flex: 1, color: 'white' }}>
        <div style={{ fontSize: '26px', fontWeight: '900', marginBottom: '6px' }}>{user?.name || 'Doctor Name'}</div>
        <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '4px', fontWeight: '600' }}>Doctor ID: &nbsp;<span style={{ opacity: 1 }}>{user?.doctorId || 'MED—'}</span></div>
        <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '4px', fontWeight: '600' }}>Specialization: &nbsp;<span style={{ opacity: 1 }}>{user?.specialization || '—'}</span></div>
        <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '4px', fontWeight: '600' }}>Age: &nbsp;<span style={{ opacity: 1 }}>{user?.age || '—'}</span></div>
        <div style={{ fontSize: '14px', opacity: 0.85, fontWeight: '600' }}>Hospital Name: &nbsp;<span style={{ opacity: 1 }}>{user?.hospitalName || '—'}</span></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', borderRadius: '50px', padding: '8px 20px', alignSelf: 'flex-start' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2ECC71', boxShadow: '0 0 0 3px rgba(46,204,113,0.25)' }} />
        <span style={{ fontWeight: 'bold', color: '#111', fontSize: '14px' }}>ACTIVE</span>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', right: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', background: 'radial-gradient(circle, #A8E063 0%, #56AB2F 100%)', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '14px' }}>✔</span>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', color: 'white', fontSize: '13px' }}>Verified Doctor</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px' }}>License &amp; Authenticated</div>
        </div>
      </div>
    </div>
  );

  // ─── Stats Row ────────────────────────────────────────────────────────────
  const StatsRow = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {[
        { icon: '📋', label: 'Pending Approvals', value: stats.pendingRecords, color: '#F39C12', path: '/doctor/pending-approvals' },
        { icon: '👥', label: 'My Patients', value: stats.totalPatients, color: '#2979FF', path: '/doctor/patient-management' },
        { icon: '🔐', label: 'Access Requests', value: stats.accessRequests, color: '#9C27B0', path: null },
        { icon: '💊', label: 'Add Prescription', value: 'Go →', color: '#2ECC71', path: '/doctor/add-record' },
      ].map((s, i) => (
        <div
          key={i}
          onClick={() => s.path && navigate(s.path)}
          style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderLeft: `4px solid ${s.color}`, cursor: s.path ? 'pointer' : 'default', transition: 'transform 0.15s, box-shadow 0.15s' }}
          onMouseEnter={e => { if (s.path) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: s.color, marginBottom: '4px' }}>{loading ? '—' : s.value}</div>
          <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );

  // ─── Pending Records Preview ───────────────────────────────────────────────
  const PendingSection = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '17px', fontWeight: 'bold' }}>📋 Pending Record Approvals</span>
        <button onClick={() => navigate('/doctor/pending-approvals')} style={{ backgroundColor: '#E8EAF6', color: '#1A237E', border: 'none', borderRadius: '50px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>View All</button>
      </div>
      {loading && <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>}
      {!loading && pendingRecords.length === 0 && (
        <div style={{ textAlign: 'center', padding: '28px', color: '#999' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
          <div>No pending records — you're all caught up!</div>
        </div>
      )}
      {!loading && pendingRecords.map((rec, i) => (
        <div key={rec._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#FAFAFA', borderRadius: '12px', marginBottom: '8px', border: '1px solid #f0f0f0' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{rec.patientName || 'Unknown Patient'}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{rec.recordType} · {rec.hospitalName || '—'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#FFF8E1', color: '#F39C12', borderRadius: '50px', padding: '3px 12px', fontSize: '12px', fontWeight: 'bold' }}>PENDING</span>
            <button onClick={() => navigate('/doctor/pending-approvals')} style={{ backgroundColor: '#1A237E', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Review</button>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Recent Activity ───────────────────────────────────────────────────────
  const ActivitySection = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <div style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '16px' }}>🕐 Recent Activity</div>
      {loading && <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>}
      {!loading && recentActivity.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{a.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{a.text}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Quick Actions Grid ────────────────────────────────────────────────────
  const QuickActions = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {[
        { icon: '🔍', label: 'Search Patient', sub: 'By EMAR ID, Name, Aadhaar', path: '/doctor/search', color: '#2979FF' },
        { icon: '📋', label: 'Approve Records', sub: 'Review staff-uploaded records', path: '/doctor/pending-approvals', color: '#F39C12' },
        { icon: '💊', label: 'Add Prescription', sub: 'Write & save prescription', path: '/doctor/add-record', color: '#2ECC71' },
        { icon: '👥', label: 'My Patients', sub: 'View treated patients list', path: '/doctor/patient-management', color: '#9C27B0' },
      ].map(a => (
        <div
          key={a.path}
          onClick={() => navigate(a.path)}
          style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px', border: `1.5px solid ${a.color}22`, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${a.color}0d`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', backgroundColor: `${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{a.icon}</div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#111', fontSize: '15px', marginBottom: '3px' }}>{a.label}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{a.sub}</div>
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