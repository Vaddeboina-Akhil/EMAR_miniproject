import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userRole }) => {
  const navLinks = {
    patient: ['Dashboard', 'Medical History', 'Prescriptions', 'Profile'],
    doctor: ['Dashboard', 'Patients', 'Pending Approvals'],
    staff: ['Upload Record', 'Visit Entry']
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">EMAR</Link>
          </div>
          <div className="flex items-center space-x-4">
            {navLinks[userRole || 'patient'].map((item) => (
              <Link
                key={item}
                to={`/${userRole}/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item}
              </Link>
            ))}
            <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
