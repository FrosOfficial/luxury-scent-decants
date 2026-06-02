import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  // The user object returned from Laravel's /me endpoint
  const [localUser, setLocalUser] = useState(null);
  // True while we're checking the token on mount
  const [loading, setLoading] = useState(true);

  const fetchLocalProfile = async () => {
    try {
      const response = await api.get('/me');
      setLocalUser(response.data);
      return response.data;
    } catch (error) {
      // 401 means token is invalid/expired, clear everything
      if (error.response?.status === 401) {
        localStorage.removeItem('lsd_auth_token');
        setLocalUser(null);
      }
      return null;
    }
  };

  // On app load, check if we have a saved token and verify it's still valid
  useEffect(() => {
    const token = localStorage.getItem('lsd_auth_token');
    if (token) {
      fetchLocalProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login: POST /auth/login → get token → save to localStorage → fetch profile
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('lsd_auth_token', token);
    await fetchLocalProfile();
  };

  // Register: POST /auth/register → get token → save to localStorage → fetch profile
  const register = async (fullName, email, password, passwordConfirmation) => {
    const response = await api.post('/auth/register', {
      name: fullName,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    const { token } = response.data;
    localStorage.setItem('lsd_auth_token', token);
    await fetchLocalProfile();
  };

  // Logout: tell Laravel to invalidate the token, then clear local state
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors on logout, just clear local state regardless
      console.warn('Logout request failed, clearing local state anyway.');
    } finally {
      localStorage.removeItem('lsd_auth_token');
      setLocalUser(null);
    }
  };

  const value = {
    localUser,
    loading,
    isAuthenticated: !!localUser,
    isAdmin: localUser?.role === 'admin',
    login,
    register,
    logout,
    fetchLocalProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
