import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('emar_token');
    const userRole = localStorage.getItem('emar_role');
    
    if (token && userRole) {
      setUser({ token });
      setRole(userRole);
    }
    setLoading(false);
  }, []);

  const login = (token, role) => {
    localStorage.setItem('emar_token', token);
    localStorage.setItem('emar_role', role);
    setUser({ token });
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem('emar_token');
    localStorage.removeItem('emar_role');
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
