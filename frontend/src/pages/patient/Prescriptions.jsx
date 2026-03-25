import React from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import PrescriptionCard from '../../components/features/PrescriptionCard';
import Card from '../../components/ui/Card';

const Prescriptions = () => {
  const prescriptions = [
    {
      medication: 'Amlodipine 5mg',
      dosage: '1 tablet daily morning',
      date: '2024-01-20',
      cost: 120,
      instructions: 'Take after breakfast. Monitor BP daily.',
      priority: true
    },
    {
      medication: 'Atorvastatin 20mg',
      dosage: '1 tablet at night',
      date: '2024-01-15',
      cost: 180,
      instructions: 'Take before dinner. Avoid grapefruit juice.',
      priority: false
    }
  ];

  return (
    <PatientLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
        
        <Card title={`Active Prescriptions (${prescriptions.length})`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prescriptions.map((prescription, index) => (
              <PrescriptionCard key={index} prescription={prescription} />
            ))}
          </div>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default Prescriptions;
