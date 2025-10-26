import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { User } from '../types';
import * as apiService from '../services/apiService';
import { useError } from './ErrorContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithProvider: (provider: 'google' | 'facebook') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useError();

  const verifyUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await apiService.getMe();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      // Not showing an error here as it's expected on first load without a session
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await apiService.login(email, password);
      setUser(loggedInUser);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Login failed.");
      throw err; // re-throw to be caught in the component
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const newUser = await apiService.register(email, password);
      setUser(newUser);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Registration failed.");
      throw err; // re-throw
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };
  
  const loginWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      const loggedInUser = await apiService.loginWithProvider(provider);
      setUser(loggedInUser);
    } catch (err) {
      showError(err instanceof Error ? err.message : `Sign-in with ${provider.charAt(0).toUpperCase() + provider.slice(1)} failed.`);
      throw err; // re-throw to be caught in the component
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, loginWithProvider }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};