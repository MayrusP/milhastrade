export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
}