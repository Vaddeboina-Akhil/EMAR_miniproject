import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';
import { getUser } from '../../utils/auth';
import { recordService } from '../../services/recordService';

const DoctorPatientProfiles = () => {
  const navigate = useNavigate();
  const doctor = getUser();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctor?._id) {
      fetchPatients();
    }
  }, [doctor?._id]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const records = await recordService.getDoctorRecords(doctor._id);
      const recordArray = Array.isArray(records) ? records : [];

      // Extract unique patients from records
      const patientMap = new Map();
      recordArray.forEach(record => {
        const patientId = record.patientId?._id || record.patientId;
        if (patientId && !patientMap.has(String(patientId))) {
          patientMap.set(String(patientId), {
            _id: patientId,
            name: record.patientName || 'Unknown Patient',
            recordCount: 1,
            lastRecord: record.createdAt
          });
        } else if (patientId) {
          const patient = patientMap.get(String(patientId));
          patient.recordCount++;
          patient.lastRecord = record.createdAt;
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <DoctorLayout activePage="My Patients">
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1A237E',
          borderRadius: '16px',
          padding: '28px',
          color: 'white',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            👥 My Patients
          </div>
          <div style={{ fontSize: '14px', opacity: 0.85 }}>
            Patients you've added prescriptions for
          </div>
        </div>

        {loading && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>⏳</div>
            <div style={{ color: '#666' }}>Loading your patients...</div>
          </div>
        )}

        {!loading && patients.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
              No patients yet
            </div>
            <div style={{ color: '#666', marginBottom: '20px' }}>
              Start by adding a prescription to build your patient list
            </div>
            <button
              onClick={() => navigate('/doctor/add-record')}
              style={{
                backgroundColor: '#1A237E',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Add Prescription
            </button>
          </div>
        )}

        {!loading && patients.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {patients.map(patient => (
              <div
                key={patient._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1.5px solid transparent'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#1A237E';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => navigate(`/doctor/patient/${patient._id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#1A237E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#111' }}>
                      {patient.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      ID: {patient._id.toString().slice(-8)}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                      Records
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A237E' }}>
                      {patient.recordCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                      Last Record
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                      {formatDate(patient.lastRecord)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientProfiles;
