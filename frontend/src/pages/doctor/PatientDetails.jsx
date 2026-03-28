import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctor = getUser();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [consentStatus, setConsentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [reason, setReason] = useState('');
  const [showReasonBox, setShowReasonBox] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const data = await api.get(`/patient/profile/${id}`);
      setPatient(data.patient || data);
      // Fetch records
      const recs = await api.get(`/records/${id}`);
      setRecords(Array.isArray(recs) ? recs : []);
      // Check consent
      const consents = await api.get(`/consent/${id}`);
      if (Array.isArray(consents)) {
        const myConsent = consents.find(c => c.doctorId === (doctor?._id || doctor?.id));
        setConsentStatus(myConsent?.status || null);
      }
    } catch (err) {
      console.error('Failed to fetch patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!reason.trim()) { alert('Please enter a reason for access'); return; }
    setRequesting(true);
    try {
      await api.post('/consent/request', {
        patientId: id,
        patientEmail: patient?.email,
        doctorId: doctor?._id || doctor?.id,
        doctorName: doctor?.name,
        hospitalName: doctor?.hospitalName,
        reason
      });
      setConsentStatus('pending');
      setShowReasonBox(false);
      setReason('');
      alert('Access request sent! Patient will be notified.');
    } catch (err) {
      alert('Failed to send request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const typeIcons = { 'Lab Report': '🧪', 'Prescription': '💊', 'Scan': '🩻', 'Surgery': '🏥', 'Follow-Up': '🔁', 'Other': '📄' };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return (
    <DoctorLayout activePage="Search Patient">
      <div style={{ textAlign: 'center', padding: '80px', color: '#999' }}>Loading patient...</div>
    </DoctorLayout>
  );

  if (!patient) return (
    <DoctorLayout activePage="Search Patient">
      <div style={{ textAlign: 'center', padding: '80px', color: '#E74C3C' }}>Patient not found</div>
    </DoctorLayout>
  );

  return (
    <DoctorLayout activePage="Search Patient">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          backgroundColor: 'transparent', border: 'none',
          color: '#1A237E', fontWeight: 'bold', fontSize: '14px',
          cursor: 'pointer', marginBottom: '16px', padding: 0
        }}>
          ← Back to Search
        </button>

        {/* Patient Info Card */}
        <div style={{
          backgroundColor: '#1A237E', borderRadius: '20px',
          padding: '28px', color: 'white', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0
          }}>
            {patient.profileImage
              ? <img src={patient.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : patient.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px' }}>{patient.name}</div>
            <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '3px' }}>
              EMAR ID: {patient.patientId || '—'} · Age: {patient.age || '—'} · Blood: {patient.bloodGroup || '—'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.75 }}>
              Aadhaar: {patient.aadhaarId || '—'} · 📞 {patient.phone || '—'}
            </div>
            {patient.allergies && (
              <div style={{ marginTop: '8px', fontSize: '13px', backgroundColor: 'rgba(255,100,100,0.2)', borderRadius: '8px', padding: '4px 10px', display: 'inline-block' }}>
                ⚠️ Allergies: {patient.allergies}
              </div>
            )}
          </div>

          {/* Consent status + action */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {consentStatus === 'approved' && (
              <span style={{ backgroundColor: '#2ECC71', color: 'white', borderRadius: '50px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold' }}>
                ✅ Access Approved
              </span>
            )}
            {consentStatus === 'pending' && (
              <span style={{ backgroundColor: '#F39C12', color: 'white', borderRadius: '50px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold' }}>
                🕐 Request Pending
              </span>
            )}
            {consentStatus === 'denied' && (
              <span style={{ backgroundColor: '#E74C3C', color: 'white', borderRadius: '50px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold' }}>
                ❌ Access Denied
              </span>
            )}
            {!consentStatus && (
              <button
                onClick={() => setShowReasonBox(true)}
                style={{
                  backgroundColor: '#2979FF', color: 'white',
                  border: 'none', borderRadius: '50px',
                  padding: '10px 20px', fontSize: '14px',
                  fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                🔐 Request Access
              </button>
            )}
          </div>
        </div>

        {/* Request Access Reason Box */}
        {showReasonBox && (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '20px', border: '1.5px solid #2979FF'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px', color: '#111' }}>
              🔐 Reason for Access Request
            </div>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Patient consultation for cardiac evaluation..."
              rows={3}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                border: '1.5px solid #ddd', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box', resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={handleRequestAccess}
                disabled={requesting}
                style={{
                  backgroundColor: '#2979FF', color: 'white',
                  border: 'none', borderRadius: '50px',
                  padding: '10px 24px', fontSize: '14px',
                  fontWeight: 'bold', cursor: requesting ? 'not-allowed' : 'pointer'
                }}
              >
                {requesting ? 'Sending...' : '✅ Send Request'}
              </button>
              <button
                onClick={() => { setShowReasonBox(false); setReason(''); }}
                style={{
                  backgroundColor: '#f5f5f5', color: '#666',
                  border: 'none', borderRadius: '50px',
                  padding: '10px 20px', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Medical History — only if approved */}
        {consentStatus === 'approved' ? (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>
              📋 Medical History ({records.length} records)
            </div>
            {records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
                No medical records found for this patient
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {records.map((rec, i) => (
                  <div key={rec._id || i} style={{
                    backgroundColor: '#F9FAFB', borderRadius: '12px',
                    padding: '16px', border: '1px solid #eee',
                    display: 'flex', gap: '12px', alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      backgroundColor: '#E8EAF6', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                    }}>
                      {typeIcons[rec.recordType] || '📄'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#111', marginBottom: '3px' }}>
                        {rec.diagnosis || rec.recordType || 'Medical Record'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        🏥 {rec.hospitalName || '—'} · 👨‍⚕️ {rec.doctorName || '—'}
                      </div>
                      {rec.description && (
                        <div style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', marginTop: '4px' }}>
                          {rec.description}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', color: '#999' }}>{formatDate(rec.visitDate || rec.createdAt)}</div>
                      <span style={{
                        backgroundColor: rec.status === 'approved' ? '#E8F5E9' : '#FFF8E1',
                        color: rec.status === 'approved' ? '#2ECC71' : '#F39C12',
                        borderRadius: '50px', padding: '2px 10px',
                        fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
                      }}>
                        {rec.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add prescription button */}
            <button
              onClick={() => navigate(`/doctor/add-record?patientId=${id}&patientName=${patient.name}`)}
              style={{
                marginTop: '16px', width: '100%', padding: '14px',
                backgroundColor: '#1A237E', color: 'white',
                border: 'none', borderRadius: '12px', fontSize: '15px',
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              💊 Add Prescription for this Patient
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '40px', textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
              Access Required
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              {consentStatus === 'pending'
                ? 'Your access request is pending patient approval'
                : 'Request access to view this patient\'s medical records'}
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default PatientDetails;