import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface CreateUserResult {
  user: User;
  temporaryPassword: string;
}

export interface UsersSearchParams {
  search?: string;
  role?: string;
  membershipStatus?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'users';

  // Profile endpoints (authenticated user)
  getMyProfile(): Observable<User> {
    return this.api.get<User>(`${this.endpoint}/profile/me`);
  }

  updateMyProfile(data: UpdateProfileRequest): Observable<User> {
    return this.api.patch<User>(`${this.endpoint}/profile/me`, data);
  }

  changeMyPassword(data: ChangePasswordRequest): Observable<void> {
    return this.api.patch<void>(`${this.endpoint}/profile/me/password`, data);
  }

  getMyQr(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/${this.endpoint}/profile/me/qr`, {
      responseType: 'blob',
    });
  }

  // Admin/Trainer endpoints
  getAll(params?: UsersSearchParams): Observable<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.role) queryParams.set('role', params.role);
    if (params?.membershipStatus) queryParams.set('membershipStatus', params.membershipStatus);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;

    return this.api.get<PaginatedResponse<User>>(url);
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`${this.endpoint}/${id}`);
  }

  create(data: Pick<User, 'name' | 'email' | 'role'>): Observable<CreateUserResult> {
    return this.api.post<CreateUserResult>(this.endpoint, data);
  }

  update(id: string, data: Partial<User>): Observable<User> {
    return this.api.patch<User>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
