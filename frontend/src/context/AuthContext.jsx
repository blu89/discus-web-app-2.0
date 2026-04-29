import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await authAPI.verify();
        if (response.data.authenticated) {
          // Cookies are automatically sent, no need to store token
          setUser(response.data.user);
        }
      } catch (error) {
        // Not authenticated, clear user state
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    // Cookie is automatically set by backend
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Cookie is automatically cleared by backend
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
