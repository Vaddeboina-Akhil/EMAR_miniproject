import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';
import { api } from '../../services/api';
import PatientLayout from '../../components/layout/PatientLayout';

const Prescriptions = () => {
  const navigate = useNavigate();
  const patient = getUser();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔐 Validate that the logged-in user is actually a patient
  if (!patient || patient.role !== 'patient') {
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
            You must log in as a patient to access this page
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('emar_user');
              localStorage.removeItem('emar_token');
              navigate('/login');
            }}
            style={{
              backgroundColor: '#2ECC71', color: 'white', border: 'none',
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

  useEffect(() => {
    fetchPrescriptions();
  }, [patient]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // Get all approved records for this patient
      const response = await api.get(`/records/${patient._id}`);
      const allRecords = Array.isArray(response) ? response : response.records || [];
      
      // Filter: Only approved records AND records created by doctors
      const doctorPrescriptions = allRecords.filter(record => 
        record.status === 'approved' && record.uploaderRole === 'doctor'
      );
      
      setPrescriptions(doctorPrescriptions);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PatientLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          ⏳ Loading prescriptions...
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: '#DC143C' }}>
          ❌ Error: {error}
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div style={{
        padding: '32px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', margin: '0 0 8px 0' }}>
            💊 Prescriptions
          </h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
            Active prescriptions from your doctors
          </p>
        </div>

        {prescriptions.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '2px dashed #DDD'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💊</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              No prescriptions yet
            </div>
            <div style={{ fontSize: '13px', color: '#999' }}>
              Your doctor prescriptions will appear here
            </div>
          </div>
        ) : (
          <div>
            {prescriptions.map((prescription) => (
              <div
                key={prescription._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  border: '2px solid #E0E0E0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                      {prescription.recordType}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      By Dr. {prescription.doctorName} • {new Date(prescription.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#E8F5E9',
                    color: '#1B5E20',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ✅ Active
                  </div>
                </div>

                {/* Diagnosis */}
                {prescription.diagnosis && (
                  <div style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    borderLeft: '4px solid #DC143C'
                  }}>
                    <strong style={{ color: '#666' }}>Diagnosis:</strong>
                    <div style={{ marginTop: '4px', color: '#333' }}>
                      {prescription.diagnosis}
                    </div>
                  </div>
                )}

                {/* Medicines */}
                {prescription.medicines && (
                  <div style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    borderLeft: '4px solid #2196F3'
                  }}>
                    <strong style={{ color: '#666' }}>Medicines:</strong>
                    <div style={{ marginTop: '4px', color: '#333' }}>
                      {prescription.medicines}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {prescription.notes && (
                  <div style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '13px',
                    borderLeft: '4px solid #FF9800'
                  }}>
                    <strong style={{ color: '#666' }}>Notes:</strong>
                    <div style={{ marginTop: '4px', color: '#333' }}>
                      {prescription.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default Prescriptions;
