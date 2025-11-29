export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface MessageResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  link?: string; // Solo en desarrollo
}
