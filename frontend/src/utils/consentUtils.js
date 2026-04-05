/**
 * Utility functions for handling restricted patient data on frontend
 */

export const isRestricted = (value) => value === '[RESTRICTED]' || value === null;

export const displayValue = (value, label = 'field') => {
  if (isRestricted(value)) {
    return <span className="text-red-500 font-semibold">🔒 {label} Restricted</span>;
  }
  return value || 'N/A';
};

export const getRestrictionMessage = (restrictions) => {
  if (!restrictions) return null;

  const denied = [];
  if (restrictions.basicInfo) denied.push('Basic Info');
  if (restrictions.prescriptions) denied.push('Prescriptions');
  if (restrictions.fullReports) denied.push('Full Reports');

  return denied.length > 0 ? denied.join(', ') : null;
};

export const shouldShowField = (restrictions, fieldType) => {
  switch (fieldType) {
    case 'basic':
      return !restrictions.basicInfo;
    case 'prescriptions':
      return !restrictions.prescriptions;
    case 'reports':
      return !restrictions.fullReports;
    default:
      return true;
  }
};

export const formatConsentExpiry = (expiresAt) => {
  if (!expiresAt) return 'Indefinite';
  
  const date = new Date(expiresAt);
  const now = new Date();
  const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return 'Expired';
  if (daysLeft === 0) return 'Expires Today';
  if (daysLeft === 1) return 'Expires Tomorrow';
  
  return `Expires in ${daysLeft} days (${date.toLocaleDateString()})`;
};

export const getConsentStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'revoked':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const hasValidConsent = (consent) => {
  if (!consent || consent.status !== 'approved') return false;
  if (consent.revokedAt) return false;
  if (consent.expiresAt && new Date() > new Date(consent.expiresAt)) return false;
  return true;
};
