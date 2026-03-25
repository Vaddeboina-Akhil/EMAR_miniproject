import React, { useEffect, useState } from 'react';
import DoctorLayout from '../../components/layout/DoctorLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { doctorService } from '../../services/doctorService';

const PendingApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await doctorService.getPendingApprovals();
        setApprovals(data.pending || []);
      } catch (err) {
        setError(err.message || 'Failed to load pending approvals');
      }
    };
    load();
  }, []);

  const approveRequest = async (id) => {
    try {
      await doctorService.approveConsent(id);
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to approve request');
    }
  };

  const rejectRequest = async (id) => {
    try {
      await doctorService.rejectConsent(id);
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    }
  };

  return (
    <DoctorLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals ({approvals.length})</h1>
        {error ? <p className="text-red-700">{error}</p> : null}
        
        <div className="grid gap-6">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {approval.patient} ↔ {approval.doctor}
                  </h3>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600">Purpose: {approval.purpose}</p>
                    <p className="text-sm text-gray-600">
                      Records: {approval.records.join(', ')}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span>Requested: {approval.date}</span>
                      {approval.expires ? <span>Expires: {approval.expires}</span> : null}
                    </div>
                  </div>
                </div>
                <Badge variant="warning" className="px-3 py-1">PENDING</Badge>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={() => approveRequest(approval.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => rejectRequest(approval.id)}
                  variant="danger"
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default PendingApprovals;
