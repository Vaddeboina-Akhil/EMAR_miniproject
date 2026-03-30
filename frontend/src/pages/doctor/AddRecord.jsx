import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';

const AddRecord = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctor = getUser();

  const prefillPatientId = searchParams.get('patientId') || '';
  const prefillPatientName = searchParams.get('patientName') || '';

  const [patientId, setPatientId] = useState(prefillPatientId);
  const [patientName, setPatientName] = useState(prefillPatientName);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    recordType: 'Prescription',
    diagnosis: '',
    description: '',
    medicines: '',
    visitDate: new Date().toISOString().split('T')[0],
  });

  const recordTypes = ['Prescription', 'Lab Report', 'Scan', 'Surgery', 'Follow-Up', 'Other'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) { alert('Please enter a Patient ID'); return; }
    if (!form.diagnosis.trim()) { alert('Please enter a diagnosis'); return; }
    setSubmitting(true);
    try {
      await api.post('/records/prescription', {
        patientId,
        patientName,
        recordType: form.recordType,
        diagnosis: form.diagnosis,
        medicines: form.medicines,
        notes: form.description,
        visitDate: form.visitDate,
        doctorId: doctor?._id,
        doctorName: doctor?.name,
        hospitalName: doctor?.hospitalName
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (prefillPatientId) navigate(-1);
        else { setPatientId(''); setPatientName(''); setForm({ recordType: 'Prescription', diagnosis: '', description: '', medicines: '', visitDate: new Date().toISOString().split('T')[0] }); }
      }, 2000);
    } catch (err) {
      alert('Failed to add record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid #ddd', fontSize: '15px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit'
  };

  const labelStyle = {
    fontWeight: 'bold', fontSize: '14px',
    color: '#333', marginBottom: '6px', display: 'block'
  };

  return (
    <DoctorLayout activePage="Add Prescription">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

        {/* Header */}
        <div style={{
          backgroundColor: '#1A237E', borderRadius: '16px',
          padding: '28px', color: 'white', marginBottom: '24px'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            💊 Add Prescription / Record
          </div>
          <div style={{ fontSize: '14px', opacity: 0.85 }}>
            Records added by doctors are automatically approved and added to patient history
          </div>
        </div>

        {success && (
          <div style={{
            backgroundColor: '#E8F5E9', border: '1.5px solid #2ECC71',
            borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div style={{ fontWeight: 'bold', color: '#2ECC71' }}>
              Record added successfully and added to patient history!
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Patient Selection */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>
              👤 Patient Info
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Patient MongoDB ID *</label>
                <input
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  placeholder="Patient _id from database"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1A237E'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Patient Name</label>
                <input
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Patient full name"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1A237E'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>
              📋 Record Details
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Record Type *</label>
                <select
                  name="recordType"
                  value={form.recordType}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                >
                  {recordTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Visit Date *</label>
                <input
                  type="date"
                  name="visitDate"
                  value={form.visitDate}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1A237E'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Diagnosis *</label>
              <input
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="e.g. Type 2 Diabetes, Hypertension..."
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#1A237E'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Medicines / Prescription</label>
              <textarea
                name="medicines"
                value={form.medicines}
                onChange={handleChange}
                placeholder="e.g. Metformin 500mg - 1 tablet twice daily&#10;Amlodipine 5mg - 1 tablet daily..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = '#1A237E'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div>
              <label style={labelStyle}>Doctor Notes</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Additional notes, follow-up instructions..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = '#1A237E'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>
          </div>

          {/* Doctor Info (auto-filled) */}
          <div style={{
            backgroundColor: '#E8EAF6', borderRadius: '16px',
            padding: '16px 20px', marginBottom: '20px',
            display: 'flex', gap: '20px', flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '13px', color: '#444' }}>
              <span style={{ color: '#666' }}>Doctor: </span>
              <strong>{doctor?.name || '—'}</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#444' }}>
              <span style={{ color: '#666' }}>Hospital: </span>
              <strong>{doctor?.hospitalName || '—'}</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#444' }}>
              <span style={{ color: '#666' }}>Specialization: </span>
              <strong>{doctor?.specialization || '—'}</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#2ECC71', fontWeight: 'bold' }}>
              ✅ Auto-approved (doctor record)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting || success}
              style={{
                flex: 1, padding: '14px', backgroundColor: '#1A237E',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '16px', fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Adding Record...' : '💊 Add Record to Patient History'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '14px 24px', backgroundColor: '#f5f5f5',
                color: '#666', border: 'none', borderRadius: '12px',
                fontSize: '15px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DoctorLayout>
  );
};

export default AddRecord;