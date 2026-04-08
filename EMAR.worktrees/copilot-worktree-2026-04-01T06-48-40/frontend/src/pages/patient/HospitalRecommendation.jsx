import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/layout/PatientLayout';
import { getUser } from '../../utils/auth';
import HospitalCard from '../../components/features/HospitalCard';
import Card from '../../components/ui/Card';

const HospitalRecommendation = () => {
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

  const recommendedHospitals = [
    {
      name: 'Apollo Hospitals',
      rating: 4.8,
      reviews: 1247,
      specialty: 'Multi-specialty Care',
      address: 'Bannerghatta Rd, Bengaluru',
      distance: 3.2
    },
    {
      name: 'Fortis Hospital',
      rating: 4.6,
      reviews: 892,
      specialty: 'Cardiology & Neurology',
      address: 'Bannerghatta Rd, Bengaluru',
      distance: 5.1
    },
    {
      name: 'Manipal Hospital',
      rating: 4.7,
      reviews: 1564,
      specialty: 'Orthopedics Excellence',
      address: 'Old Airport Rd, Bengaluru',
      distance: 8.4
    }
  ];

  return (
    <PatientLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Recommendations</h1>
        <p className="text-xl text-gray-600">AI-powered recommendations based on your medical history</p>
        
        <Card title="Top Recommendations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedHospitals.map((hospital, index) => (
              <HospitalCard key={index} hospital={hospital} />
            ))}
          </div>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default HospitalRecommendation;
