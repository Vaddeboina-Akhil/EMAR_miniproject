import { useState, useEffect } from 'react';

export const useDoctor = (doctorId) => {
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        // TODO: Fetch from API
        setDoctor({
          id: doctorId,
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          patientsCount: 247,
          hospital: 'Apollo Hospitals'
        });
        setPatients([
          { id: 'P001', name: 'John Doe', lastVisit: '2024-01-20' },
          { id: 'P002', name: 'Priya Sharma', lastVisit: '2024-01-18' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  return {
    doctor,
    patients,
    loading
  };
};
