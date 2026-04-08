/**
 * 🔐 PROTECTED ROUTE HELPER
 * Use this utility to check authentication in components
 */

export const isAuthenticated = () => {
  const token = localStorage.getItem('emar_token');
  const user = localStorage.getItem('emar_user');
  const role = localStorage.getItem('emar_role');
  
  return !!(token && user && role);
};

export const hasRole = (requiredRole) => {
  const role = localStorage.getItem('emar_role');
  return role === requiredRole;
};

export const isPatient = () => hasRole('patient');
export const isDoctor = () => hasRole('doctor');
export const isStaff = () => hasRole('staff');
export const isAdmin = () => hasRole('admin');

export const checkAuthAndRole = (requiredRole) => {
  return isAuthenticated() && hasRole(requiredRole);
};

export const getAuthStatus = () => ({
  isAuthenticated: isAuthenticated(),
  role: localStorage.getItem('emar_role'),
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem('emar_user') || 'null');
    } catch {
      return null;
    }
  })()
});
