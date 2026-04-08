import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ConsentModal = ({ isOpen, onClose, onSubmit, consentData, setConsentData }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(consentData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical Record Access Consent">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Doctor Name"
          placeholder="Dr. John Smith"
          value={consentData.doctor}
          onChange={(e) => setConsentData({...consentData, doctor: e.target.value})}
        />
        <Input
          label="Purpose"
          placeholder="Regular checkup / Emergency / Research"
          value={consentData.purpose}
          onChange={(e) => setConsentData({...consentData, purpose: e.target.value})}
        />
        <Input
          label="Duration (days)"
          type="number"
          placeholder="30"
          value={consentData.duration}
          onChange={(e) => setConsentData({...consentData, duration: e.target.value})}
        />
        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1">Grant Access</Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsentModal;
