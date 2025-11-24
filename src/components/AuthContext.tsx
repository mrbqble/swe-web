import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authService,
  LoginRequest,
  SignupRequest,
} from '../services/authService';
import { User, transformUserResponse } from '../utils/userUtils';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'consumer' | 'supplier_owner',
    organizationName?: string,
  ) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');

      if (savedUser && accessToken) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getCurrentUser();
          const user = transformUserResponse(currentUser);
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const credentials: LoginRequest = { email, password };
      const tokens = await authService.login(credentials);

      // Store tokens
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // Get user info
      const userData = await authService.getCurrentUser();
      const user = transformUserResponse(userData);

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      setIsLoading(false);
      // Error is already handled by the caller (Login component)
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'consumer' | 'supplier_owner',
    organizationName?: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData: SignupRequest = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        organization_name: organizationName,
      };
      const tokens = await authService.signup(userData);

      // Store tokens
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // Get user info
      const userResponse = await authService.getCurrentUser();
      const user = transformUserResponse(userResponse);

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Signup failed:', error);
      setIsLoading(false);
      // Error is already handled by the caller (Login component)
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authService.getCurrentUser();
      const user = transformUserResponse(userData);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, user might need to re-authenticate
      // Don't clear tokens here - let the API interceptor handle it
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
