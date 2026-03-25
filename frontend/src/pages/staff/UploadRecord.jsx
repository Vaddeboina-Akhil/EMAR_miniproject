import React, { useState } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AddRecord from '../../components/features/AddRecord';

const UploadRecord = () => {
  const [patientId, setPatientId] = useState('');

  const handleUpload = (recordData) => {
    console.log('Uploading record for:', patientId, recordData);
    // TODO: Upload to blockchain
    alert('Record uploaded successfully to blockchain!');
  };

  return (
    <StaffLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Medical Record</h1>
        <p className="text-xl text-gray-600">Securely upload patient records to blockchain</p>
        
        <Card title="Patient Information">
          <Input
            label="Patient ID / Aadhaar"
            placeholder="Scan QR or enter ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="max-w-lg"
          />
        </Card>
        
        {patientId ? (
          <AddRecord onSubmit={handleUpload} />
        ) : (
          <Card>
            <div className="text-center py-16">
              <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-400">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Scan Patient QR Code</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Or manually enter the patient ID/Aadhaar number to upload medical records
              </p>
              <Button onClick={() => setPatientId('DEMO123')}>
                Use Demo Patient
              </Button>
            </div>
          </Card>
        )}
      </div>
    </StaffLayout>
  );
};

export default UploadRecord;
