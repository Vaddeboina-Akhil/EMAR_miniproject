import React from 'react';
import { useParams } from 'react-router-dom';
import DoctorLayout from '../../components/layout/DoctorLayout';

const DoctorPatientDetails = () => {
  const { id } = useParams();
  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Patient Details</h1>
        <p className="mt-2 text-gray-600">Details for patient ID: {id}</p>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientDetails;
