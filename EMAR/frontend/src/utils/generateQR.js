import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};

export const generatePatientQRData = (patientId, aadhaar) => {
  return {
    type: 'EMAR_PATIENT_QR',
    patientId,
    aadhaar,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
};

export const validateQRData = (qrData) => {
  return qrData.type === 'EMAR_PATIENT_QR' && 
         qrData.patientId && 
         qrData.aadhaar;
};
