// src/context/AuthContext.tsx
import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: any;
  authTokens: any;
  loginUser: (credentials: any, rememberMe: boolean) => Promise<{success: boolean, error?: string}>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;