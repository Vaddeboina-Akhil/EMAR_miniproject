import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';

const ConsentSettings = ({ patientId }) => {
  const [settings, setSettings] = useState({
    basicInfo: true,
    prescriptions: true,
    fullReports: true,
    emergencyAccess: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [patientId]);

  const fetchSettings = async () => {
    try {
      const response = await patientService.getConsentSettings(patientId);
      setSettings(response.data.consentSettings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching consent settings:', error);
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientService.updateConsentSettings(patientId, settings);
      setMessage('✅ Consent settings updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error updating consent settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Consent Settings</h2>
      <p className="text-gray-600 mb-6">
        Control what information healthcare providers can see when they access your data.
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Basic Info Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-semibold">Basic Information</h3>
            <p className="text-sm text-gray-600">
              Name, age, blood group, contact details
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.basicInfo}
              onChange={() => handleToggle('basicInfo')}
              className="w-5 h-5 cursor-pointer"
            />
          </label>
        </div>

        {/* Prescriptions Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-semibold">Prescriptions</h3>
            <p className="text-sm text-gray-600">
              Medicine details and prescription history
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.prescriptions}
              onChange={() => handleToggle('prescriptions')}
              className="w-5 h-5 cursor-pointer"
            />
          </label>
        </div>

        {/* Full Reports Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <h3 className="font-semibold">Full Medical Reports</h3>
            <p className="text-sm text-gray-600">
              Complete medical records and documents
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.fullReports}
              onChange={() => handleToggle('fullReports')}
              className="w-5 h-5 cursor-pointer"
            />
          </label>
        </div>

        {/* Emergency Access Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 bg-orange-50">
          <div>
            <h3 className="font-semibold">Emergency Access Override</h3>
            <p className="text-sm text-gray-600">
              Allow access to all data during medical emergencies
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.emergencyAccess}
              onChange={() => handleToggle('emergencyAccess')}
              className="w-5 h-5 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ConsentSettings;
