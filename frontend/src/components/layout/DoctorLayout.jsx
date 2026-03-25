import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DoctorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="doctor" />
      <div className="flex">
        <Sidebar userRole="doctor" />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
