import emailjs from 'emailjs-com';

const SERVICE_ID = 'service_9p3ywyy';
const TEMPLATE_OTP = 'template_semhmkb';
const TEMPLATE_NOTIFY = 'template_vpwz6jl';
const PUBLIC_KEY = '9u50kjcdQNxkLX7jb';
const APP_URL = window.location.origin;

export const sendOTPEmail = (toEmail, toName, otp) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_OTP, {
    to_email: toEmail,
    to_name: toName,
    passcode: otp,
    time: new Date().toLocaleTimeString()
  }, PUBLIC_KEY);
};

export const sendAccessRequestEmail = (toEmail, toName, doctorName, hospitalName, reason) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_NOTIFY, {
    to_email: toEmail,
    to_name: toName,
    message: `Dr. ${doctorName} from ${hospitalName} has requested access to your medical records.\n\nReason: ${reason}\nDate: ${new Date().toLocaleDateString()}\n\nPlease login to EMAR to Approve or Deny this request.`,
    app_url: APP_URL
  }, PUBLIC_KEY);
};

export const sendRecordUploadEmail = (toEmail, toName, recordType, hospitalName, staffName) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_NOTIFY, {
    to_email: toEmail,
    to_name: toName,
    message: `A new ${recordType} has been uploaded to your profile.\n\nHospital: ${hospitalName}\nUploaded by: ${staffName}\nDate: ${new Date().toLocaleDateString()}\n\nPlease login to EMAR to view your records.`,
    app_url: APP_URL
  }, PUBLIC_KEY);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};