import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { authAPI } from '../services/api.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuthData();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const data = await response.json();
      
      if (response.ok) {
        // Store tokens
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
        
        // Decode user info from token payload
        const payload = JSON.parse(atob(data.access.split('.')[1]));
        const userData = { 
          id: payload.user_id, 
          username: credentials.username,
          role: payload.role || 'student' 
        };
        
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.detail || data.non_field_errors?.[0] || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    clearAuthData();
  };

  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const canEditCourse = (course) => {
    if (!user) return false;
    return user.role === 'admin' || 
           (user.role === 'instructor' && course.instructor.includes(user.username));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    canEditCourse
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};