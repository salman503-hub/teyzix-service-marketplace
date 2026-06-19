import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/api/users/profile/');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/api/users/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    
    const profileRes = await api.get('/api/users/profile/');
    setUser(profileRes.data);
    return profileRes.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const register = async (username, email, password, role, phone) => {
    await api.post('/api/users/register/', { username, email, password, role, phone });
  };

  const updateProfile = async (profileData) => {
    const res = await api.patch('/api/users/profile/', profileData);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
