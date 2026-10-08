import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../api/axios';

export const AuthContext = createContext();

// Custom hook to use the auth context easily
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading true

  // ✅ Fix: Reload user data on page refresh if token exists
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('access_token');
      
      if (storedToken) {
        try {
          // ⚠️ IMPORTANT: Replace 'auth.getProfile()' with your actual API endpoint 
          // that returns the user data (e.g., auth.me(), auth.verify(), etc.)
          const res = await auth.getProfile(); 
          
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            logout(); // Token is invalid
          }
        } catch (error) {
          console.error("Session expired or invalid", error);
          logout(); // Token expired or network error
        }
      }
      
      setLoading(false); // Finished checking auth state
    };

    loadUser();
  }, []);

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
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user, 
        loading, // ✅ Expose loading state
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