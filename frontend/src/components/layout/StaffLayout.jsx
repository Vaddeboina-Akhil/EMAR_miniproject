import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const StaffLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole="staff" />
      <div className="flex">
        <Sidebar userRole="staff" />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
