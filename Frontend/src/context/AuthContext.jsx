import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('assetflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage / Backend verification
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('assetflow_token');

      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setToken(storedToken);
            localStorage.setItem('assetflow_user', JSON.stringify(response.data.user));
          } else {
            throw new Error('Invalid user profile');
          }
        } catch (e) {
          localStorage.removeItem('assetflow_token');
          localStorage.removeItem('assetflow_user');
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem('assetflow_token');
        localStorage.removeItem('assetflow_user');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('assetflow_token', newToken);
    localStorage.setItem('assetflow_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  // Signup handler (registers user without auto-logging in)
  const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
