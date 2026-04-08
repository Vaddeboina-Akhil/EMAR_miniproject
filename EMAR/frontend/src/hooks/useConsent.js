import { useState, useEffect } from 'react';

export const useConsent = (patientId) => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchConsents = async () => {
      setLoading(true);
      try {
        // TODO: Fetch consent records from blockchain/backend
        setConsents([
          {
            id: 'CONS001',
            doctor: 'Dr. Sarah Johnson',
            status: 'approved',
            purpose: 'Regular checkup',
            records: ['REC001', 'REC002'],
            granted: '2024-01-20',
            expires: '2024-02-19'
          },
          {
            id: 'CONS002',
            doctor: 'Dr. Raj Patel',
            status: 'pending',
            purpose: 'Emergency access',
            records: ['REC003'],
            granted: '2024-01-18',
            expires: '2024-02-17'
          }
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsents();
  }, [patientId]);

  const grantConsent = async (consentData) => {
    try {
      // TODO: Submit consent to backend/blockchain
      console.log('Granting consent:', consentData);
      return { success: true };
    } catch (err) {
      throw new Error('Failed to grant consent');
    }
  };

  const revokeConsent = async (consentId) => {
    try {
      // TODO: Revoke consent
      console.log('Revoking consent:', consentId);
      setConsents(prev => prev.map(c => 
        c.id === consentId ? {...c, status: 'revoked'} : c
      ));
    } catch (err) {
      throw new Error('Failed to revoke consent');
    }
  };

  return {
    consents,
    loading,
    error,
    grantConsent,
    revokeConsent
  };
};
