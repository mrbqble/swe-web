import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: 'consumer' | 'supplier_owner';
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
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
}

export const authService = new AuthService();
