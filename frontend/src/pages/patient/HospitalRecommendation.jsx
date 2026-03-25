import React from 'react';
import PatientLayout from '../../components/layout/PatientLayout';
import HospitalCard from '../../components/features/HospitalCard';
import Card from '../../components/ui/Card';

const HospitalRecommendation = () => {
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
