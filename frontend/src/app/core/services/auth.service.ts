import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  LoginRequest,
  RegisterRequest,
  TokensResponse,
  SessionResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordForcedRequest,
} from '../models';
import { ForgotPasswordResponse, MessageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'auth';

  login(credentials: LoginRequest): Observable<TokensResponse> {
    return this.api.post<TokensResponse>(`${this.endpoint}/login`, credentials);
  }

  register(data: RegisterRequest): Observable<TokensResponse> {
    return this.api.post<TokensResponse>(`${this.endpoint}/register`, data);
  }

  refreshToken(refreshToken: string): Observable<TokensResponse> {
    return this.http.post<TokensResponse>(
      `${environment.apiUrl}/${this.endpoint}/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
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

  changePasswordForced(data: ChangePasswordForcedRequest): Observable<TokensResponse> {
    return this.api.post<TokensResponse>(`${this.endpoint}/change-password-forced`, data);
  }
}
