import React, { useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AddRecord from '../../components/features/AddRecord';

const DoctorAddRecord = () => {
  const [patientId, setPatientId] = useState('');

  const handleSubmitRecord = (recordData) => {
    console.log('Adding record for patient:', patientId, recordData);
    // TODO: Submit to backend/blockchain
  };

  return (
    <DoctorLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Medical Record</h1>
        
        <Card title="Patient Selection">
          <Input
            label="Patient ID / Aadhaar"
            placeholder="Enter P001 or 987654321012"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="max-w-md"
          />
        </Card>
        
        {patientId && (
          <AddRecord onSubmit={handleSubmitRecord} />
        )}
        
        {!patientId && (
          <Card>
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Patient ID</h3>
              <p className="text-gray-600 mb-6">Enter the patient ID or Aadhaar number to add medical records</p>
            </div>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorAddRecord;
