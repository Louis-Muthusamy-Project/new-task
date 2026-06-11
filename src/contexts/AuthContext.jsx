import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  // Role can be 'admin', 'agency', 'client', or null
  const [role, setRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  });

  useEffect(() => {
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [role]);

  const login = (selectedRole) => {
    setRole(selectedRole);
    // Redirect based on role
    if (selectedRole === 'admin') navigate('/dashboard');
    else if (selectedRole === 'agency') navigate('/agency/overview');
    else if (selectedRole === 'client') navigate('/client/dashboard');
  };

  const logout = () => {
    setRole(null);
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
