import api from './api';
import { 
  User, 
  CreateUserRequest, 
  LoginRequest, 
  AuthResponse, 
  UpdateUserRequest,
  ApiResponse 
} from '../types';

export class AuthService {
  static async register(data: CreateUserRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;
      this.setAuthData(user, token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro no registro');
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    
    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;
      this.setAuthData(user, token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Erro no login');
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      this.clearAuthData();
    }
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    
    throw new Error(response.data.message || 'Erro ao obter dados do usuário');
  }

  static async updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>('/users/profile', data);
    
    if (response.data.success && response.data.data) {
      const user = response.data.data.user;
      this.setUser(user);
      return user;
    }
    
    throw new Error(response.data.message || 'Erro ao atualizar perfil');
  }

  static setAuthData(user: User, token: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  static setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  static clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}