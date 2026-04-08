import React from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const HospitalCard = ({ hospital }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-2">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{hospital.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="success">{hospital.rating}★</Badge>
                <span className="text-sm text-gray-500">({hospital.reviews} reviews)</span>
              </div>
            </div>
          </div>
          <Badge variant="primary" className="text-xs px-3 py-1">{hospital.distance}km</Badge>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm">
            <span className="w-3 text-green-500 mr-2">●</span>
            {hospital.specialty}
          </div>
          <div className="text-sm text-gray-600">{hospital.address}</div>
        </div>
        
        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all group-hover:scale-[1.02]">
          View Details →
        </Button>
      </div>
    </div>
  );
};

HospitalCard.defaultProps = {
  hospital: {
    name: 'Apollo Hospitals',
    rating: 4.8,
    reviews: 1247,
    specialty: 'Multi-specialty Care',
    address: 'Bannerghatta Rd, Bengaluru',
    distance: 3.2
  }
};

export default HospitalCard;
