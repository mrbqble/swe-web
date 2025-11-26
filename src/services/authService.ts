import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'consumer' | 'supplier_owner';
  organization_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  // Optional supplier-related fields (if backend includes them)
  company_logo?: string | null;
  supplier?: {
    company_logo?: string | null;
    company_name?: string | null;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  }

  async signup(userData: SignupRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/signup', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/users/me');
    return response.data;
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', {
      email,
      new_password: newPassword,
    });
  }
}

export const authService = new AuthService();
