import React, { createContext, useState } from 'react';
import { auth } from '../api/axios';

// ✅ Named export
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);  // ✅ Added user state

  const establishSession = (sessionData) => {
    const { access_token: accessToken, ...userData } = sessionData || {};
    if (!accessToken) return false;

    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    return true;
  };

  const login = async (email, password) => {
    try {
      const res = await auth.login({ email, password });
      if (res.data.success && establishSession(res.data.data)) {
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      // ✅ Handle errors properly
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid credentials' 
      };
    }
  };

  const register = async (data) => {
    try {
      const res = await auth.signup(data);
      if (res.data.success && establishSession(res.data.data)) {
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);  // ✅ Clear user on logout
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user,  // ✅ Added user to context
        isAuthenticated: !!token, 
        login, 
        register,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};