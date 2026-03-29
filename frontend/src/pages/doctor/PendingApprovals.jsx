import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordService } from '../../services/apiService';
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
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '2px solid #E0E0E0',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
            <div style={{ fontSize: '32px' }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '17px', color: '#111', marginBottom: '6px' }}>
                {record.patientName}
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                <div>Patient ID: {record.patientId}</div>
                <div>Record Type: {record.recordType} | Hospital: {record.hospitalName}</div>
              </div>
            </div>
          </div>
          <span style={{
            backgroundColor: color.bg,
            color: color.text,
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            {record.status}
          </span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #E0E0E0', margin: '16px 0' }}></div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            backgroundColor: '#F9F9F9',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px'
          }}>
            <strong style={{ color: '#666' }}>Diagnosis:</strong>
            <div style={{ marginTop: '6px', color: '#333' }}>
              {record.diagnosis || '—'}
            </div>
          </div>

          {record.medicines && (
            <div style={{
              backgroundColor: '#F9F9F9',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px'
            }}>
              <strong style={{ color: '#666' }}>Medicines:</strong>
              <div style={{ marginTop: '6px', color: '#333' }}>
                {record.medicines}
              </div>
            </div>
          )}
        </div>

        {record.notes && (
          <div style={{
            backgroundColor: '#F0F0F0',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '13px',
            borderLeft: '4px solid #DC143C'
          }}>
            <strong style={{ color: '#666' }}>Notes:</strong>
            <div style={{ marginTop: '6px', color: '#333' }}>
              {record.notes}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div style={{
            backgroundColor: '#F5F5F5',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '13px',
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
                  padding: '10px 12px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  minHeight: '70px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#DC143C'}
                onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleApprove(record._id)}
                disabled={processingId === record._id}
                style={{
                  flex: 1,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  fontSize: '13px',
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
                  padding: '10px 16px',
                  fontWeight: 'bold',
                  fontSize: '13px',
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
            padding: '12px',
            fontSize: '12px',
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
            padding: '12px',
            fontSize: '12px',
            color: '#B71C1C',
            fontWeight: '500'
          }}>
            ❌ Rejected {record.rejectionReason && `- ${record.rejectionReason}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <DoctorLayout activePage="Approvals">
      <div style={{
        padding: '32px',
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#F5F5F5',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', marginBottom: '8px', margin: 0 }}>
            📋 Medical Record Approvals
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
            Review and approve medical records submitted by hospital staff
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '32px',
          borderBottom: '2px solid #E0E0E0',
          backgroundColor: 'white',
          padding: '16px 24px',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
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
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === tab.key ? '#DC143C' : '#999',
                paddingBottom: '12px',
                borderBottom: activeTab === tab.key ? '3px solid #DC143C' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
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
                padding: '2px 8px',
                fontSize: '12px',
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
          <div style={{ textAlign: 'center', padding: '60px', color: '#999', fontSize: '16px' }}>
            ⏳ Loading records...
          </div>
        )}

        {/* Empty State */}
        {!loading && pendingRecords.length === 0 && approvedRecords.length === 0 && rejectedRecords.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '2px dashed #DDD'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              No records to review
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>
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
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666',
                  marginBottom: '16px',
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
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                  All caught up!
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
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
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#2E7D32',
                  marginBottom: '16px',
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
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                  No approved records
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
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
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#C62828',
                  marginBottom: '16px',
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
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                  No rejected records
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
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
