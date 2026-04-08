import { useState, useEffect } from 'react';

export const usePatient = (patientId) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      setLoading(true);
      try {
        // TODO: Fetch from backend API
        const mockPatient = {
          id: patientId,
          name: 'John Doe',
          recordsCount: 23,
          consents: 5
        };
        const mockRecords = [
          { id: 'REC001', type: 'prescription', date: '2024-01-20' },
          { id: 'REC002', type: 'lab_result', date: '2024-01-15' }
        ];
        
        setPatient(mockPatient);
        setRecords(mockRecords);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const refetch = () => {
    // Trigger refetch
  };

  return {
    patient,
    records,
    loading,
    error,
    refetch
  };
};
