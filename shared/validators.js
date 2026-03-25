// Shared validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validatePassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
};

export const validateAadhaar = (aadhaar) => {
  return /^\d{12}$/.test(aadhaar.replace(/[\s\-]/g, ''));
};
