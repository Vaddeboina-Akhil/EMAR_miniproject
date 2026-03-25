import React from 'react';
import QRCodeReact from 'qrcode.react';

const QRCode = ({ value, size = 256, className = '' }) => {
  return (
    <div className={`flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow ${className}`}>
      <QRCodeReact value={value || 'EMAR Patient ID'} size={size} />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">Medical Record QR Code</p>
        <p className="text-xs text-gray-500 mt-1">Scan to access records</p>
      </div>
    </div>
  );
};

export default QRCode;
