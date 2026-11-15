import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('civicfix_token'));
  const [loading, setLoading] = useState(true);

  // Verify stored token on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('civicfix_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('civicfix_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res.success && res.token) {
      localStorage.setItem('civicfix_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('civicfix_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isCitizen: user?.role === 'citizen',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
