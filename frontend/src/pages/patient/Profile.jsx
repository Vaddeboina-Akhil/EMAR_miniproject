import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { getUser } from '../../utils/auth';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Profile = () => {
  const navigate = useNavigate();
  const user = getUser();

  // 🔐 Validate that the logged-in user is actually a patient
  if (!user || user.role !== 'patient') {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '40px',
          textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Access Denied</h2>
          <p style={{ color: '#666', margin: '0 0 24px 0' }}>
            You must log in as a patient to access this page
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('emar_user');
              localStorage.removeItem('emar_token');
              navigate('/login');
            }}
            style={{
              backgroundColor: '#2ECC71', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 24px', fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    aadhaar: '9876 5432 1098',
    email: 'john.doe@email.com',
    phone: '+91 9876543210',
    bloodGroup: 'O+',
    allergies: 'Penicillin, Dust',
    emergencyContact: 'Jane Doe - +91 9876543211'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profile);
    setEditMode(false);
  };

  return (
    <PatientLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button
            onClick={() => setEditMode(!editMode)}
            variant={editMode ? 'secondary' : 'primary'}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <Card title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              disabled={!editMode}
            />
            <Input
              label="Aadhaar Number"
              value={profile.aadhaar}
              onChange={(e) => setProfile({...profile, aadhaar: e.target.value})}
              disabled={!editMode}
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              disabled={!editMode}
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              disabled={!editMode}
            />
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Blood Group"
                value={profile.bloodGroup}
                onChange={(e) => setProfile({...profile, bloodGroup: e.target.value})}
                disabled={!editMode}
              />
              <Input
                label="Allergies"
                value={profile.allergies}
                onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                disabled={!editMode}
              />
            </div>
            <Input
              label="Emergency Contact"
              value={profile.emergencyContact}
              onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
              className="md:col-span-2"
              disabled={!editMode}
            />
          </div>
          
          {editMode && (
            <div className="flex space-x-3 pt-6">
              <Button type="submit" onClick={handleUpdate} className="flex-1 bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PatientLayout>
  );
};

export default Profile;
