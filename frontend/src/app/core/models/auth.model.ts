import { Role } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SessionResponse {
  status: string;
  user: AuthenticatedUser;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  userId: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}
