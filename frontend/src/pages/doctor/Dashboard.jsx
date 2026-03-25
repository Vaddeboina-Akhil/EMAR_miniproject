import React from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';

const DoctorDashboard = () => {
  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="mt-4 text-gray-600">Welcome to the doctor dashboard. Use the sidebar to navigate.</p>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
