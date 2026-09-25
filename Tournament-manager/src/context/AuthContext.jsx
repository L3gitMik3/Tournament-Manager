import React, { createContext, useState } from 'react';
import { auth } from '../api/axios';

// ✅ Named export
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);  // ✅ Added user state

  const login = async (email, password) => {
    try {
      // ✅ Only ONE call
      const res = await auth.login({ email, password });
      
      // ✅ Check response structure correctly
      if (res.data.success && res.data.data.access_token) {
        const { access_token, ...userData } = res.data.data;
        
        // ✅ Store token in localStorage and state
        localStorage.setItem('access_token', access_token);
        setToken(access_token);
        
        // ✅ Store user data
        setUser(userData);
        
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
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};