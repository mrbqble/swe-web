import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authService,
  LoginRequest,
  SignupRequest,
  UserResponse,
} from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    role: 'consumer' | 'supplier_owner',
  ) => Promise<boolean>;
  logout: () => void;
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
          setUser(JSON.parse(savedUser));
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

      // Create user object for frontend (you might want to adjust this based on your backend user model)
      const user: User = {
        id: userData.id.toString(),
        email: userData.email,
        name: userData.email.split('@')[0], // Simple name from email
        role: userData.role,
        avatar: userData.email.substring(0, 2).toUpperCase(),
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: 'consumer' | 'supplier_owner',
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userData: SignupRequest = { email, password, role };
      const tokens = await authService.signup(userData);

      // Store tokens
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      // Get user info
      const userResponse = await authService.getCurrentUser();

      const user: User = {
        id: userResponse.id.toString(),
        email: userResponse.email,
        name: userResponse.email.split('@')[0],
        role: userResponse.role,
        avatar: userResponse.email.substring(0, 2).toUpperCase(),
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
