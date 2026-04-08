import React from 'react';
import Badge from '../ui/Badge';

const PrescriptionCard = ({ prescription }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{prescription.medication}</h3>
            <p className="text-sm text-gray-500 mb-2">Dosage: {prescription.dosage}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Active</Badge>
              {prescription.priority && <Badge variant="warning">Priority</Badge>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">₹{prescription.cost}</p>
            <p className="text-xs text-gray-500">Issued: {prescription.date}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
          <p className="text-sm text-gray-700">{prescription.instructions}</p>
        </div>
      </div>
    </div>
  );
};

PrescriptionCard.defaultProps = {
  prescription: {
    medication: 'Medication Name',
    dosage: '1 tablet daily',
    date: '2024-01-15',
    cost: 150,
    instructions: 'Take after meals',
    priority: false
  }
};

export default PrescriptionCard;
