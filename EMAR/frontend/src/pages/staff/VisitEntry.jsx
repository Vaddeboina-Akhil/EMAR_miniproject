import React, { useState } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const VisitEntry = () => {
  const [visitData, setVisitData] = useState({
    patientId: '',
    doctorName: '',
    visitType: '',
    symptoms: '',
    vitals: '',
    notes: ''
  });

  const handleSubmitVisit = (e) => {
    e.preventDefault();
    console.log('Visit entry:', visitData);
    // TODO: Save visit to backend
    alert('Visit recorded successfully!');
    setVisitData({
      patientId: '',
      doctorName: '',
      visitType: '',
      symptoms: '',
      vitals: '',
      notes: ''
    });
  };

  return (
    <StaffLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">OPD Visit Entry</h1>
        
        <form onSubmit={handleSubmitVisit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Patient & Doctor Information">
            <Input
              label="Patient ID"
              placeholder="P001 / Aadhaar"
              value={visitData.patientId}
              onChange={(e) => setVisitData({...visitData, patientId: e.target.value})}
              required
            />
            <Input
              label="Doctor Name"
              placeholder="Dr. John Smith"
              value={visitData.doctorName}
              onChange={(e) => setVisitData({...visitData, doctorName: e.target.value})}
              required
            />
            <Input
              label="Visit Type"
              as="select"
              value={visitData.visitType}
              onChange={(e) => setVisitData({...visitData, visitType: e.target.value})}
              required
            >
              <option value="">Select type</option>
              <option>OPD Consultation</option>
              <option>Emergency</option>
              <option>Follow-up</option>
              <option>Diagnostic Test</option>
            </Input>
          </Card>
          
          <Card title="Clinical Notes">
            <Input
              label="Chief Complaints / Symptoms"
              as="textarea"
              rows={3}
              placeholder="Patient complaints..."
              value={visitData.symptoms}
              onChange={(e) => setVisitData({...visitData, symptoms: e.target.value})}
            />
            <Input
              label="Vitals (BP/Pulse/SpO2)"
              placeholder="120/80, 72 bpm, 98%"
              value={visitData.vitals}
              onChange={(e) => setVisitData({...visitData, vitals: e.target.value})}
            />
            <Input
              label="Additional Notes"
              as="textarea"
              rows={4}
              placeholder="Diagnosis, treatment plan, next visit..."
              value={visitData.notes}
              onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
            />
          </Card>
          
          <div className="lg:col-span-2 flex space-x-4 pt-6">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              Record Visit
            </Button>
            <Button type="button" variant="secondary" className="flex-1">
              Clear Form
            </Button>
          </div>
        </form>
      </div>
    </StaffLayout>
  );
};

export default VisitEntry;
