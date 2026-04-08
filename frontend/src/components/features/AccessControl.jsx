import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { formatConsentExpiry, getConsentStatusColor, hasValidConsent } from '../../utils/consentUtils';

const AccessControl = ({ patientId }) => {
  const [activeConsents, setActiveConsents] = useState([]);
  const [pendingConsents, setPendingConsents] = useState([]);
  const [allConsents, setAllConsents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [revokeId, setRevokeId] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => {
    fetchConsents();
  }, [patientId]);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const [active, pending, all] = await Promise.all([
        patientService.getActiveConsents(patientId),
        patientService.getPendingConsents(patientId),
        patientService.getAllConsents(patientId)
      ]);
      
      setActiveConsents(active.data);
      setPendingConsents(pending.data);
      setAllConsents(all.data);
    } catch (error) {
      console.error('Error fetching consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (consentId) => {
    try {
      await patientService.revokeAccess(consentId, revokeReason);
      setRevokeId(null);
      setRevokeReason('');
      await fetchConsents();
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading access control...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Access Control</h2>
      <p className="text-gray-600 mb-6">
        Manage who has access to your medical data and what information they can view.
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Active Access ({activeConsents.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Pending ({pendingConsents.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          All History
        </button>
      </div>

      {/* Active Access Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeConsents.length === 0 ? (
            <p className="text-gray-500">No active access granted</p>
          ) : (
            activeConsents.map(consent => (
              <ConsentCard
                key={consent._id}
                consent={consent}
                onRevoke={() => setRevokeId(consent._id)}
                showRevoke={true}
              />
            ))
          )}
        </div>
      )}

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingConsents.length === 0 ? (
            <p className="text-gray-500">No pending access requests</p>
          ) : (
            pendingConsents.map(consent => (
              <ConsentCard key={consent._id} consent={consent} />
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && allConsents && (
        <div className="space-y-6">
          {Object.entries(allConsents).map(([status, consents]) => (
            <div key={status}>
              <h3 className="font-bold text-lg mb-2 capitalize">{status}</h3>
              {consents.length === 0 ? (
                <p className="text-gray-500">No {status} consents</p>
              ) : (
                <div className="space-y-2">
                  {consents.map(consent => (
                    <ConsentCard key={consent._id} consent={consent} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Revoke Modal */}
      {revokeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-bold mb-4">Revoke Access?</h3>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Reason for revocation (optional)"
              className="w-full p-2 border rounded-lg mb-4"
              rows="3"
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleRevoke(revokeId)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Revoke
              </button>
              <button
                onClick={() => setRevokeId(null)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ConsentCard = ({ consent, onRevoke, showRevoke }) => {
  const doctor = consent.doctorId;
  const isValid = hasValidConsent(consent);

  return (
    <div className={`p-4 border rounded-lg ${
      isValid ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-lg">{doctor?.name || 'Unknown'}</h4>
          <p className="text-sm text-gray-600">
            {doctor?.specialization || 'N/A'} • {doctor?.hospitalName || 'N/A'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          getConsentStatusColor(consent.status)
        }`}>
          {consent.status.toUpperCase()}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <p><strong>Reason:</strong> {consent.reason || 'Not specified'}</p>
        <p><strong>Expires:</strong> {formatConsentExpiry(consent.expiresAt)}</p>
      </div>

      {consent.consentDetails && (
        <div className="text-sm mb-3">
          <p className="font-semibold mb-1">Can Access:</p>
          <ul className="list-disc list-inside text-gray-700">
            {consent.consentDetails.basicInfo && <li>Basic Information</li>}
            {consent.consentDetails.prescriptions && <li>Prescriptions</li>}
            {consent.consentDetails.fullReports && <li>Full Reports</li>}
            {consent.consentDetails.emergencyAccess && <li>Emergency Override</li>}
          </ul>
        </div>
      )}

      {showRevoke && isValid && (
        <button
          onClick={onRevoke}
          className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
        >
          Revoke Access
        </button>
      )}
    </div>
  );
};

export default AccessControl;
