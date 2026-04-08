import React, { createContext, useContext, useReducer, useEffect } from 'react';

const UserContext = createContext();

const initialState = {
  userProfile: null,
  preferences: {},
  loading: false
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'UPDATE_PREFERENCES':
      return { 
        ...state, 
        preferences: { ...state.preferences, ...action.payload } 
      };
    case 'LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    // Load user profile on mount if authenticated
    const loadProfile = async () => {
      try {
        dispatch({ type: 'LOADING', payload: true });
        // TODO: Fetch user profile based on auth role
        const mockProfile = {
          name: 'John Doe',
          role: 'patient',
          avatar: null,
          preferences: {
            notifications: true,
            darkMode: false
          }
        };
        dispatch({ type: 'SET_PROFILE', payload: mockProfile });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        dispatch({ type: 'LOADING', payload: false });
      }
    };

    const token = localStorage.getItem('emar_token');
    if (token) {
      loadProfile();
    }
  }, []);

  const updateProfile = (profileData) => {
    dispatch({ type: 'SET_PROFILE', payload: profileData });
  };

  const updatePreferences = (preferences) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const value = {
    ...state,
    updateProfile,
    updatePreferences
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};

export default UserContext;
