import { apiClient } from './api';
import { API_CONFIG } from './api.config';
import { ApiError } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  city_id: string;
  privacy_consent: boolean;
  marketing_consent?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      role?: string;
    };
  };
}

export interface UserProfile {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      role?: string;
    };
  };
  user_metadata: {
    role?: string;
  };
}

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_data';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const params = new URLSearchParams();
      params.append('username', credentials.email);
      params.append('password', credentials.password);

      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      await this.setAuthData(response);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Login failed');
      }
      throw new Error('Network error during login');
    }
  }

  async register(userData: RegisterData): Promise<{ message: string; user: any }> {
    try {
      const response = await apiClient.post<{ message: string; user: any }>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Registration failed');
      }
      throw new Error('Network error during registration');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await apiClient.get<UserProfile>(API_CONFIG.ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        await this.clearAuthData();
      }
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await apiClient.post<AuthResponse>('/auth/refresh');
      await this.setAuthData(response);
      return response.access_token;
    } catch (error) {
      await this.clearAuthData();
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message || 'Failed to send reset email');
      }
      throw new Error('Network error');
    }
  }

  async setAuthData(data: AuthResponse): Promise<void> {
    // In React Native, use AsyncStorage or secure storage
    // For now, we'll use a simple in-memory storage
    this.setToken(data.access_token);
    this.setRefreshToken(data.refresh_token);
    this.setUserData(data.user);
  }

  async clearAuthData(): Promise<void> {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUserData();
  }

  private removeRefreshToken(): void {
    delete (global as any)[this.refreshTokenKey];
  }

  private setToken(token: string): void {
    // Use secure storage in production
    (global as any)[this.tokenKey] = token;
  }

  private getToken(): string | null {
    return (global as any)[this.tokenKey] || null;
  }

  private removeToken(): void {
    delete (global as any)[this.tokenKey];
  }

  private setRefreshToken(token: string): void {
    (global as any)[this.refreshTokenKey] = token;
  }

  private getRefreshToken(): string | null {
    return (global as any)[this.refreshTokenKey] || null;
  }

  private setUserData(user: any): void {
    (global as any)[this.userKey] = user;
  }

  private getUserData(): any {
    return (global as any)[this.userKey];
  }

  private removeUserData(): void {
    delete (global as any)[this.userKey];
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();