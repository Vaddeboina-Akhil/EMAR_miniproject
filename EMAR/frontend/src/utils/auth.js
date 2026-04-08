export const getUser = () => JSON.parse(localStorage.getItem('emar_user') || 'null');
export const setUser = (user) => localStorage.setItem('emar_user', JSON.stringify(user));
export const getRole = () => localStorage.getItem('emar_role');
export const logout = () => {
  localStorage.removeItem('emar_user');
  localStorage.removeItem('emar_token');
  localStorage.removeItem('emar_role');
};
export const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};
