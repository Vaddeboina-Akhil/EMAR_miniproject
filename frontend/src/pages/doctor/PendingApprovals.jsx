import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const PendingApprovals = () => {
  const navigate = useNavigate();
  const doctor = getUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const doctorId = doctor?._id || doctor?.id;
      const data = await api.get(`/records/pending/${doctorId}`);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch pending records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (recordId, action) => {
    setActing(recordId);
    try {
      await api.put(`/records/approve/${recordId}`, { status: action });
      setRecords(prev => prev.filter(r => r._id !== recordId));
    } catch (err) {
      alert(`Failed to ${action} record. Please try again.`);
    } finally {
      setActing(null);
    }
  };

  const typeIcons = { 'Lab Report': '🧪', 'Prescription': '💊', 'Scan': '🩻', 'Surgery': '🏥', 'Follow-Up': '🔁', 'Other': '📄' };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <DoctorLayout activePage="Pending Approvals">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#1A237E', borderRadius: '16px',
          padding: '28px', color: 'white', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              📋 Pending Record Approvals
            </div>
            <div style={{ fontSize: '14px', opacity: 0.85 }}>
              Review and approve records uploaded by hospital staff
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '12px', padding: '12px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: '900' }}>{records.length}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Pending</div>
          </div>
        </div>

        {/* Info banner */}
        <div style={{
          backgroundColor: '#FFF8E1', borderRadius: '12px',
          padding: '14px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
          border: '1px solid #FFE082'
        }}>
          <span style={{ fontSize: '18px' }}>⭐</span>
          <div style={{ fontSize: '14px', color: '#795548' }}>
            <strong>Important:</strong> Approving a record makes it official in the patient's medical history and creates a blockchain audit log. Rejected records are removed from the system.
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            Loading pending records...
          </div>
        )}

        {!loading && records.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              All caught up!
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
              No pending records to approve at this time
            </div>
          </div>
        )}

        {!loading && records.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {records.map((rec, i) => (
              <div key={rec._id || i} style={{
                backgroundColor: 'white', borderRadius: '16px',
                padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1.5px solid #FFF8E1'
              }}>
                {/* Record Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      backgroundColor: '#E8EAF6', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '22px'
                    }}>
                      {typeIcons[rec.recordType] || '📄'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#111' }}>
                        {rec.diagnosis || rec.recordType || 'Medical Record'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                        Patient: <strong>{rec.patientName || '—'}</strong>
                      </div>
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: '#FFF8E1', color: '#F39C12',
                    borderRadius: '50px', padding: '4px 14px',
                    fontSize: '12px', fontWeight: 'bold'
                  }}>
                    PENDING APPROVAL
                  </span>
                </div>

                {/* Record Details */}
                <div style={{
                  backgroundColor: '#F9FAFB', borderRadius: '12px',
                  padding: '16px', marginBottom: '16px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
                }}>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    <span style={{ color: '#999' }}>Record Type: </span>{rec.recordType || '—'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    <span style={{ color: '#999' }}>Hospital: </span>{rec.hospitalName || '—'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    <span style={{ color: '#999' }}>Uploaded by: </span>{rec.staffName || '—'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    <span style={{ color: '#999' }}>Visit Date: </span>{formatDate(rec.visitDate)}
                  </div>
                  {rec.description && (
                    <div style={{ fontSize: '13px', color: '#555', gridColumn: '1/-1' }}>
                      <span style={{ color: '#999' }}>Notes: </span>{rec.description}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleAction(rec._id, 'approved')}
                    disabled={acting === rec._id}
                    style={{
                      flex: 1, padding: '12px',
                      backgroundColor: '#2ECC71', color: 'white',
                      border: 'none', borderRadius: '12px',
                      fontSize: '15px', fontWeight: 'bold',
                      cursor: acting === rec._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {acting === rec._id ? '...' : '✅ Approve Record'}
                  </button>
                  <button
                    onClick={() => handleAction(rec._id, 'rejected')}
                    disabled={acting === rec._id}
                    style={{
                      flex: 1, padding: '12px',
                      backgroundColor: '#E74C3C', color: 'white',
                      border: 'none', borderRadius: '12px',
                      fontSize: '15px', fontWeight: 'bold',
                      cursor: acting === rec._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {acting === rec._id ? '...' : '❌ Reject Record'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default PendingApprovals;