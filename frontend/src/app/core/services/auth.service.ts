import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  LoginRequest,
  RegisterRequest,
  TokensResponse,
  SessionResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../models';
import { ForgotPasswordResponse, MessageResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'auth';

  login(credentials: LoginRequest): Observable<TokensResponse> {
    return this.api.post<TokensResponse>(`${this.endpoint}/login`, credentials);
  }

  register(data: RegisterRequest): Observable<TokensResponse> {
    return this.api.post<TokensResponse>(`${this.endpoint}/register`, data);
  }

  refreshToken(refreshToken: string): Observable<TokensResponse> {
    return this.api.post<TokensResponse>(`${this.endpoint}/refresh`, { refreshToken });
  }

  checkSession(): Observable<SessionResponse> {
    return this.api.get<SessionResponse>(`${this.endpoint}/session`);
  }

  logout(): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/logout`);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.api.post<ForgotPasswordResponse>(`${this.endpoint}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<MessageResponse> {
    return this.api.post<MessageResponse>(`${this.endpoint}/reset-password`, data);
  }
}
