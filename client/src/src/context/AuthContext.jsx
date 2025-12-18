import { createContext, useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Login Function
  const login = async (formData) => {
    try {
      const { data } = await API.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      setUser(data);
      navigate('/groups'); // Redirect after login
    } catch (error) {
      alert(error.response?.data?.message || 'Login Failed');
    }
  };

  // Register Function (Handles Student/Faculty roles)
  const register = async (formData) => {
    try {
      const { data } = await API.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      setUser(data);
      navigate('/groups');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration Failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
