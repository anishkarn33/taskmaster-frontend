import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { access_token } = response;
      
      // Store token
      localStorage.setItem('token', access_token);
      
      // Get user info
      const userInfo = await authService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      
      toast.success('Welcome back!');
      return userInfo;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { access_token } = response;
      
      // Store token
      localStorage.setItem('token', access_token);
      
      // Get user info
      const userInfo = await authService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      
      toast.success('Account created successfully!');
      return userInfo;
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};