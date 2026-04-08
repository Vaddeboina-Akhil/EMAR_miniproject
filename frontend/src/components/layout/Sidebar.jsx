import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ userRole, className = '' }) => {
  const menuItems = {
    patient: [
      { name: 'Dashboard', icon: '📊', path: '/patient/dashboard' },
      { name: 'Medical History', icon: '📋', path: '/patient/medical-history' },
      { name: 'Prescriptions', icon: '💊', path: '/patient/prescriptions' },
      { name: 'Profile', icon: '👤', path: '/patient/profile' }
    ],
    doctor: [
      { name: 'Dashboard', icon: '📊', path: '/doctor/dashboard' },
      { name: 'Patients', icon: '👥', path: '/doctor/patient-list' },
      { name: 'Pending Approvals', icon: '⏳', path: '/doctor/pending-approvals' }
    ],
    staff: [
      { name: 'Upload Record', icon: '📤', path: '/staff/upload-record' },
      { name: 'Visit Entry', icon: '🏥', path: '/staff/visit-entry' }
    ]
  };

  return (
    <div className={`bg-gray-50 border-r w-64 flex flex-col ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">EMAR {userRole?.toUpperCase()}</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems[userRole || 'patient'].map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-white rounded-lg hover:shadow"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
