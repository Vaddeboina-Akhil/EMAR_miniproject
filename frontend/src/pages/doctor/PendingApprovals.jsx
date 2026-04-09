import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordService } from '../../services/recordService';
import { getUser } from '../../utils/auth';
import DoctorLayout from '../../components/layout/DoctorLayout';

const PendingApprovals = () => {
  const navigate = useNavigate();
  const doctor = getUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!doctor?._id) {
      navigate('/login');
      return;
    }
    fetchPendingRecords();
  }, [doctor, navigate]);

  const fetchPendingRecords = async () => {
    try {
      setLoading(true);
      const data = await recordService.getPendingRecords(doctor._id);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch pending records:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recordId) => {
    try {
      setProcessingId(recordId);
      await recordService.approveRecord(recordId);
      setRecords(records.map(r => r._id === recordId ? { ...r, status: 'approved' } : r));
      alert('✅ Record approved successfully!');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (recordId) => {
    const reason = rejectionReasons[recordId];
    if (!reason || reason.trim() === '') {
      alert('⚠️ Please enter a rejection reason');
      return;
    }

    try {
      setProcessingId(recordId);
      await recordService.rejectRecord(recordId, reason);
      setRecords(records.map(r => r._id === recordId ? { ...r, status: 'rejected', rejectionReason: reason } : r));
      setRejectionReasons({ ...rejectionReasons, [recordId]: '' });
      alert('✅ Record rejected successfully!');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRecords = records.filter(r => r.status === 'pending');
  const approvedRecords = records.filter(r => r.status === 'approved');
  const rejectedRecords = records.filter(r => r.status === 'rejected');

  const getCount = (tab) => {
    if (tab === 'pending') return pendingRecords.length;
    if (tab === 'approved') return approvedRecords.length;
    if (tab === 'rejected') return rejectedRecords.length;
    return 0;
  };

  const RecordCard = ({ record, showActions = false }) => {
    const colors = {
      pending: { bg: '#FFF3E0', text: '#E65100' },
      approved: { bg: '#E8F5E9', text: '#1B5E20' },
      rejected: { bg: '#FFEBEE', text: '#B71C1C' }
    };
    const color = colors[record.status] || colors.pending;

    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: isMobile ? '8px' : '12px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '12px' : '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '2px solid #E0E0E0',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: isMobile ? '12px' : '16px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : 0 }}>
          <div style={{ display: 'flex', gap: isMobile ? '10px' : '12px', flex: 1, width: '100%' }}>
            <div style={{ fontSize: isMobile ? '24px' : '32px', flexShrink: 0 }}>👤</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: isMobile ? '15px' : '17px', color: '#111', marginBottom: '6px', wordBreak: 'break-word' }}>
                {record.patientName}
              </div>
              <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', lineHeight: '1.5' }}>
                <div>Patient ID: {record.patientId}</div>
                <div style={{ marginTop: isMobile ? '4px' : 0 }}>Record Type: {record.recordType} | Hospital: {record.hospitalName}</div>
              </div>
            </div>
          </div>
          <span style={{
            backgroundColor: color.bg,
            color: color.text,
            borderRadius: '20px',
            padding: isMobile ? '6px 12px' : '8px 16px',
            fontSize: isMobile ? '11px' : '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {record.status}
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #E0E0E0', margin: `${isMobile ? '12px' : '16px'} 0` }}></div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '10px' : '12px', marginBottom: isMobile ? '12px' : '16px' }}>
          <div style={{
            backgroundColor: '#F9F9F9',
            borderRadius: '8px',
            padding: isMobile ? '10px' : '12px',
            fontSize: isMobile ? '12px' : '13px'
          }}>
            <strong style={{ color: '#666' }}>Diagnosis:</strong>
            <div style={{ marginTop: '6px', color: '#333', wordBreak: 'break-word' }}>
              {record.diagnosis || '—'}
            </div>
          </div>

          {record.medicines && (
            <div style={{
              backgroundColor: '#F9F9F9',
              borderRadius: '8px',
              padding: isMobile ? '10px' : '12px',
              fontSize: isMobile ? '12px' : '13px'
            }}>
              <strong style={{ color: '#666' }}>Medicines:</strong>
              <div style={{ marginTop: '6px', color: '#333', wordBreak: 'break-word' }}>
                {record.medicines}
              </div>
            </div>
          )}
        </div>

        {record.notes && (
          <div style={{
            backgroundColor: '#F0F0F0',
            borderRadius: '8px',
            padding: isMobile ? '10px' : '12px',
            marginBottom: isMobile ? '12px' : '16px',
            fontSize: isMobile ? '12px' : '13px',
            borderLeft: '4px solid #DC143C'
          }}>
            <strong style={{ color: '#666' }}>Notes:</strong>
            <div style={{ marginTop: '6px', color: '#333', wordBreak: 'break-word' }}>
              {record.notes}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div style={{
            backgroundColor: '#F5F5F5',
            borderRadius: '8px',
            padding: isMobile ? '12px' : '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '10px' : '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: isMobile ? '12px' : '13px',
                color: '#333'
              }}>
                Rejection Reason (if rejecting):
              </label>
              <textarea
                value={rejectionReasons[record._id] || ''}
                onChange={(e) => setRejectionReasons({ ...rejectionReasons, [record._id]: e.target.value })}
                placeholder="Enter rejection reason..."
                maxLength={200}
                style={{
                  width: '100%',
                  padding: isMobile ? '8px 10px' : '10px 12px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: isMobile ? '12px' : '13px',
                  fontFamily: 'inherit',
                  minHeight: isMobile ? '60px' : '70px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
              />
            </div>

            <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => handleApprove(record._id)}
                disabled={processingId === record._id}
                style={{
                  flex: 1,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: isMobile ? '10px 12px' : '10px 16px',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: processingId === record._id ? 'not-allowed' : 'pointer',
                  opacity: processingId === record._id ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (processingId !== record._id) e.target.style.backgroundColor = '#45A049';
                }}
                onMouseLeave={(e) => {
                  if (processingId !== record._id) e.target.style.backgroundColor = '#4CAF50';
                }}
              >
                {processingId === record._id ? '⏳ Processing...' : '✅ Approve'}
              </button>
              <button
                onClick={() => handleReject(record._id)}
                disabled={processingId === record._id}
                style={{
                  flex: 1,
                  backgroundColor: '#DC143C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: isMobile ? '10px 12px' : '10px 16px',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '12px' : '13px',
                  cursor: processingId === record._id ? 'not-allowed' : 'pointer',
                  opacity: processingId === record._id ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (processingId !== record._id) e.target.style.backgroundColor = '#B71C1C';
                }}
                onMouseLeave={(e) => {
                  if (processingId !== record._id) e.target.style.backgroundColor = '#DC143C';
                }}
              >
                {processingId === record._id ? '⏳ Processing...' : '❌ Reject'}
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {record.approvedBy && record.status === 'approved' && (
          <div style={{
            backgroundColor: '#E8F5E9',
            border: '2px solid #4CAF50',
            borderRadius: '6px',
            padding: isMobile ? '10px' : '12px',
            fontSize: isMobile ? '11px' : '12px',
            color: '#1B5E20',
            fontWeight: '500'
          }}>
            ✅ Approved on {record.approvalDate ? new Date(record.approvalDate).toLocaleDateString() : 'recently'}
          </div>
        )}

        {record.status === 'rejected' && (
          <div style={{
            backgroundColor: '#FFEBEE',
            border: '2px solid #DC143C',
            borderRadius: '6px',
            padding: isMobile ? '10px' : '12px',
            fontSize: isMobile ? '11px' : '12px',
            color: '#B71C1C',
            fontWeight: '500',
            wordBreak: 'break-word'
          }}>
            ❌ Rejected {record.rejectionReason && `- ${record.rejectionReason}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <DoctorLayout activePage="Pending Approvals">
      <div style={{
        padding: isMobile ? '16px' : '32px',
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#F5F5F5',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '16px' : '32px',
          marginBottom: isMobile ? '16px' : '32px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ 
            fontSize: isMobile ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#000', 
            marginBottom: '8px', 
            margin: 0 
          }}>
            📋 Medical Record Approvals
          </h1>
          <p style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            color: '#666', 
            margin: '8px 0 0 0' 
          }}>
            Review and approve medical records submitted by hospital staff
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '12px' : '24px',
          marginBottom: isMobile ? '16px' : '32px',
          borderBottom: '2px solid #E0E0E0',
          backgroundColor: 'white',
          padding: isMobile ? '12px 16px' : '16px 24px',
          borderRadius: isMobile ? '8px 8px 0 0' : '12px 12px 0 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflowX: 'auto',
          scrollBehavior: 'smooth'
        }}>
          {[
            { label: 'Pending', count: pendingRecords.length, key: 'pending' },
            { label: 'Approved', count: approvedRecords.length, key: 'approved' },
            { label: 'Rejected', count: rejectedRecords.length, key: 'rejected' }
          ].map(tab => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontSize: isMobile ? '13px' : '14px',
                fontWeight: '600',
                color: activeTab === tab.key ? '#DC143C' : '#999',
                paddingBottom: isMobile ? '10px' : '12px',
                borderBottom: activeTab === tab.key ? '3px solid #DC143C' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '6px' : '8px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) e.currentTarget.style.color = '#666';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) e.currentTarget.style.color = '#999';
              }}
            >
              {tab.label}
              <span style={{
                backgroundColor: '#F0F0F0',
                borderRadius: '12px',
                padding: isMobile ? '1px 6px' : '2px 8px',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {tab.count}
              </span>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px' : '60px', 
            color: '#999', 
            fontSize: isMobile ? '14px' : '16px' 
          }}>
            ⏳ Loading records...
          </div>
        )}

        {/* Empty State */}
        {!loading && pendingRecords.length === 0 && approvedRecords.length === 0 && rejectedRecords.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '40px 16px' : '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '2px dashed #DDD'
          }}>
            <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: 'bold', 
              color: '#333', 
              marginBottom: '8px' 
            }}>
              No records to review
            </div>
            <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#999' }}>
              All medical records have been processed
            </div>
          </div>
        )}

        {/* Pending Records */}
        {!loading && activeTab === 'pending' && (
          <div>
            {pendingRecords.length > 0 ? (
              <div>
                <div style={{
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  marginBottom: isMobile ? '12px' : '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🔔 Pending Approval ({pendingRecords.length})
                </div>
                {pendingRecords.map(record => (
                  <RecordCard key={record._id} record={record} showActions={true} />
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '40px 16px' : '60px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '12px' }}>✨</div>
                <div style={{ 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '4px' 
                }}>
                  All caught up!
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#999' }}>
                  No pending records to review
                </div>
              </div>
            )}
          </div>
        )}

        {/* Approved Records */}
        {!loading && activeTab === 'approved' && (
          <div>
            {approvedRecords.length > 0 ? (
              <div>
                <div style={{
                  fontSize: isMobile ? '12px' : '15px',
                  fontWeight: 'bold',
                  color: '#2E7D32',
                  marginBottom: isMobile ? '12px' : '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ✅ Approved ({approvedRecords.length})
                </div>
                {approvedRecords.map(record => (
                  <RecordCard key={record._id} record={record} showActions={false} />
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '40px 16px' : '60px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '12px' }}>📋</div>
                <div style={{ 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '4px' 
                }}>
                  No approved records
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#999' }}>
                  Approved records will appear here
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rejected Records */}
        {!loading && activeTab === 'rejected' && (
          <div>
            {rejectedRecords.length > 0 ? (
              <div>
                <div style={{
                  fontSize: isMobile ? '12px' : '15px',
                  fontWeight: 'bold',
                  color: '#C62828',
                  marginBottom: isMobile ? '12px' : '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ❌ Rejected ({rejectedRecords.length})
                </div>
                {rejectedRecords.map(record => (
                  <RecordCard key={record._id} record={record} showActions={false} />
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '40px 16px' : '60px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: isMobile ? '40px' : '48px', marginBottom: '12px' }}>📋</div>
                <div style={{ 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '4px' 
                }}>
                  No rejected records
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#999' }}>
                  Rejected records will appear here
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default PendingApprovals;
