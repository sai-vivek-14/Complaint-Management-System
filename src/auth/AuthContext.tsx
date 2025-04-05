import React, { createContext, useState, useContext } from 'react';

type UserData = {
  username: string;
  user_type: 'student' | 'warden' | 'worker' | 'hostel_staff';
  email: string;
  roll_number: string;
};

type AuthContextType = {
  user: UserData | null;
  token: string | null;
  refreshToken: string | null;
  login: (token: string, refreshToken: string, userData: UserData) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Corrected initial state setup
  const [user, setUser] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refresh_token'));

  const login = (token: string, refreshToken: string, userData: UserData) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setToken(token);
    setRefreshToken(refreshToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Add the useAuth hook at the bottom of the file
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
export default AuthContext;