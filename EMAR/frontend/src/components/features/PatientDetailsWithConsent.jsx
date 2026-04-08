import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { isRestricted, getRestrictionMessage, formatConsentExpiry } from '../../utils/consentUtils';

const PatientDetailsWithConsent = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [restrictions, setRestrictions] = useState(null);
  const [consent, setConsent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getPatientDetails(patientId);
      
      setPatient(response.data.patient);
      setRecords(response.data.records || []);
      setConsent(response.data._consent);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        // Access denied - no consent
        setError({
          type: 'no_consent',
          message: err.response.data.message,
          patient: err.response.data.patient
        });
      } else {
        setError({ type: 'error', message: err.message });
      }
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading patient details...</div>;
  }

  if (error?.type === 'no_consent') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-2xl font-bold text-red-800 mb-2">🔒 Access Denied</h2>
        <p className="text-red-700 mb-4">{error.message}</p>
        <div className="bg-white p-4 rounded-lg">
          <p className="text-gray-600">
            Patient ID: <strong>{error.patient?.patientId}</strong>
          </p>
          <p className="text-gray-600 mt-2">
            You need the patient's consent to view their medical information. 
            Please request access through the consent system.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-2xl font-bold text-red-800">Error</h2>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consent Info Banner */}
      {consent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-blue-900">✅ Access Approved</h3>
              <p className="text-blue-700 mt-1">
                Expires: {formatConsentExpiry(consent.expiresAt)}
              </p>
            </div>
            {consent.daysRemaining && (
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {consent.daysRemaining} days left
              </span>
            )}
          </div>
        </div>
      )}

      {/* Patient Information Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Patient Information</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-600 text-sm">Name</label>
            <p className={`font-semibold ${
              isRestricted(patient?.name) ? 'text-red-600' : ''
            }`}>
              {isRestricted(patient?.name) ? '🔒 Restricted' : patient?.name}
            </p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Patient ID</label>
            <p className="font-semibold">{patient?.patientId}</p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Age</label>
            <p className={`font-semibold ${
              isRestricted(patient?.age) ? 'text-red-600' : ''
            }`}>
              {isRestricted(patient?.age) ? '🔒 Restricted' : patient?.age || 'N/A'}
            </p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Blood Group</label>
            <p className={`font-semibold ${
              isRestricted(patient?.bloodGroup) ? 'text-red-600' : ''
            }`}>
              {isRestricted(patient?.bloodGroup) ? '🔒 Restricted' : patient?.bloodGroup || 'N/A'}
            </p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Email</label>
            <p className={`font-semibold ${
              isRestricted(patient?.email) ? 'text-red-600' : ''
            }`}>
              {isRestricted(patient?.email) ? '🔒 Restricted' : patient?.email}
            </p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Phone</label>
            <p className={`font-semibold ${
              isRestricted(patient?.phone) ? 'text-red-600' : ''
            }`}>
              {isRestricted(patient?.phone) ? '🔒 Restricted' : patient?.phone}
            </p>
          </div>

          {patient?.allergies && (
            <div className="col-span-2">
              <label className="text-gray-600 text-sm">Allergies</label>
              <p className="font-semibold">{patient?.allergies || 'None'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Medical Records */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Medical Records</h2>
        
        {patient?._reportsRestricted ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800 font-semibold">🔒 Medical Records Restricted</p>
            <p className="text-yellow-700 text-sm mt-1">
              Patient has not granted access to full medical reports
            </p>
          </div>
        ) : records.length === 0 ? (
          <p className="text-gray-500">No medical records available</p>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <div key={record._id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{record.recordType}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    record.status === 'approved' ? 'bg-green-100 text-green-800' :
                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
                
                {record.diagnosis && (
                  <p className="text-gray-700">
                    <strong>Diagnosis:</strong> {record.diagnosis}
                  </p>
                )}
                
                {patient?._prescriptionsRestricted ? (
                  <p className="text-red-600 text-sm">🔒 Prescription details restricted</p>
                ) : record.medicines && (
                  <p className="text-gray-700">
                    <strong>Medicines:</strong> {record.medicines}
                  </p>
                )}

                {record.visitDate && (
                  <p className="text-gray-600 text-sm mt-2">
                    Visit Date: {new Date(record.visitDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetailsWithConsent;
