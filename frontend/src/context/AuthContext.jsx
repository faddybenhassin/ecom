// src/context/AuthContext.js
import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// This function is now safely isolated from any React components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};