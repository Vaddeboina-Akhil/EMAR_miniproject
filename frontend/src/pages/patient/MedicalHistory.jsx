import React, { useEffect, useState } from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All Types');
  const [showDropdown, setShowDropdown] = useState(false);

  const recordTypes = ['All Types', 'Lab Report', 'Prescription', 'Scan', 'Surgery', 'Follow-Up', 'Other'];

  const typeIcons = {
    'All Types': '📋',
    'Lab Report': '🧪',
    'Prescription': '💊',
    'Scan': '🩻',
    'Surgery': '🏥',
    'Follow-Up': '🔁',
    'Other': '📄',
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const patientId = user?._id || user?.id;
        if (!patientId) return;
        const data = await api.get(`/records/${patientId}`);
        const list = Array.isArray(data) ? data : [];
        setRecords(list);
        setFiltered(list);
      } catch (err) {
        console.error('Failed to fetch records:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setShowDropdown(false);
    if (type === 'All Types') {
      setFiltered(records);
    } else {
      setFiltered(records.filter(r => r.recordType === type));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const handleNav = (page) => {
    const routes = {
      'Overview': '/patient/dashboard',
      'Medical Records': '/patient/medical-records',
      'Consent Settings': '/patient/consent',
      'Request Access': '/patient/request-access',
      'Audit Trail': '/patient/audit-trail',
      'Prescription': '/patient/prescriptions'
    };
    navigate(routes[page]);
  };

  const statusColor = {
    approved: '#2ECC71',
    pending: '#F39C12',
    rejected: '#E74C3C',
  };

  return (
    <PatientLayout activePage="Medical Records" onNavigate={handleNav}>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header Card */}
        <div style={{
          backgroundColor: '#2D6A4F',
          borderRadius: '16px',
          padding: '28px',
          color: 'white',
          position: 'relative',
          marginBottom: '20px',
          overflow: 'visible'
        }}>
          <div style={{
            fontSize: '32px', fontWeight: 'bold',
            marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            📋 Medical History
          </div>
          <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '16px' }}>
            {records.length} record{records.length !== 1 ? 's' : ''} found for your account
          </div>

          {/* Filter */}
          <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 'bold' }}>
            Filter by Type
          </div>
          <div style={{ position: 'relative', display: 'inline-block', zIndex: 200 }}>
            {/* Trigger button */}
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                border: '1.5px solid white', borderRadius: '50px',
                padding: '8px 20px', backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white', cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: '8px', fontSize: '14px',
                userSelect: 'none'
              }}
            >
              {typeIcons[selectedType]} {selectedType} ▼
            </div>

            {/* Dropdown menu */}
            {showDropdown && (
              <div style={{
                position: 'absolute', top: '110%', left: 0,
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #2D6A4F',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                zIndex: 999,
                minWidth: '180px',
                overflow: 'hidden'
              }}>
                {recordTypes.map(type => (
                  <div
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedType === type ? 'bold' : 'normal',
                      color: selectedType === type ? '#2D6A4F' : '#222',
                      backgroundColor: selectedType === type ? '#F0F7F4' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#F0F7F4';
                      e.currentTarget.style.color = '#2D6A4F';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = selectedType === type ? '#F0F7F4' : 'white';
                      e.currentTarget.style.color = selectedType === type ? '#2D6A4F' : '#222';
                    }}
                  >
                    <span>{typeIcons[type]}</span>
                    <span style={{ color: 'inherit' }}>{type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total badge */}
          <div style={{
            position: 'absolute', top: '24px', right: '24px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '12px', padding: '12px 20px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '900' }}>{records.length}</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Total Records</div>
          </div>
        </div>

        {/* Timeline Title */}
        <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '20px 0 12px 0' }}>
          Timeline {selectedType !== 'All Types' ? `— ${selectedType}` : ''}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            Loading records...
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            backgroundColor: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
              No records found
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '4px' }}>
              {selectedType !== 'All Types'
                ? `No ${selectedType} records yet`
                : 'Your medical records will appear here'}
            </div>
          </div>
        )}

        {/* Timeline Entries */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((record, index) => (
              <div key={record._id || index} style={{
                backgroundColor: 'white', borderRadius: '16px',
                padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'flex-start', gap: '16px'
              }}>
                {/* Icon */}
                <div style={{
                  width: '44px', height: '44px',
                  backgroundColor: '#F0F7F4', borderRadius: '50%',
                  flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {typeIcons[record.recordType] || '📄'}
                </div>

                {/* Content */}
                <div style={{ flexGrow: 1 }}>
                  <div style={{
                    fontSize: '18px', fontWeight: 'bold', marginBottom: '4px',
                    display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'
                  }}>
                    <span style={{ color: '#111' }}>
                      {record.diagnosis || record.recordType || 'Medical Record'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#666', fontWeight: 'normal' }}>
                      — {record.hospitalName || '—'}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 'bold',
                      padding: '2px 10px', borderRadius: '50px',
                      backgroundColor: `${statusColor[record.status] || '#ccc'}22`,
                      color: statusColor[record.status] || '#666',
                      textTransform: 'uppercase'
                    }}>
                      {record.status || 'pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                    👨‍⚕️ {record.doctorName || 'Unknown Doctor'}
                    {record.staffName && (
                      <span style={{ color: '#999' }}> · Uploaded by {record.staffName}</span>
                    )}
                  </div>
                  {record.description && (
                    <div style={{
                      fontSize: '13px', color: '#777', fontStyle: 'italic',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: '400px'
                    }}>
                      {record.description}
                    </div>
                  )}
                </div>

                {/* Date + Type */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', color: '#999' }}>Visit Date</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>
                    {formatDate(record.visitDate || record.createdAt)}
                  </div>
                  <div style={{
                    marginTop: '6px', fontSize: '11px',
                    backgroundColor: '#F0F7F4', color: '#2D6A4F',
                    padding: '3px 10px', borderRadius: '50px', fontWeight: '600'
                  }}>
                    {record.recordType || 'Record'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default MedicalHistory;