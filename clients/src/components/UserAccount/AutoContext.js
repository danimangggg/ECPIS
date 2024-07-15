import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const api_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${api_url}/api/login`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        console.error("Error checking auth status", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/login', { username, password });
      localStorage.setItem('authToken', response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error", error);
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
