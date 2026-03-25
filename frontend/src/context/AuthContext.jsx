import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
  loading: true
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return initialState;
    case 'LOADING':
      return { ...state, loading: true };
    case 'AUTH_ERROR':
      return { ...state, loading: false, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('emar_token');
        const role = localStorage.getItem('emar_role');
        
        if (token && role) {
          // Verify token with backend
          dispatch({ type: 'LOGIN_SUCCESS', payload: { token, role } });
        } else {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    initAuth();
  }, []);

  const login = (userData, token, role) => {
    localStorage.setItem('emar_token', token);
    localStorage.setItem('emar_role', role);
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: userData, token, role }
    });
  };

  const logout = () => {
    localStorage.removeItem('emar_token');
    localStorage.removeItem('emar_role');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
