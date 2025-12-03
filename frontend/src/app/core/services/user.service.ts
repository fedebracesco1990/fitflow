import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface UsersPaginationParams {
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);
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

  // Admin/Trainer endpoints
  getAll(params?: UsersPaginationParams): Observable<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;

    return this.api.get<PaginatedResponse<User>>(url);
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`${this.endpoint}/${id}`);
  }

  create(data: Partial<User> & { password: string }): Observable<User> {
    return this.api.post<User>(this.endpoint, data);
  }

  update(id: string, data: Partial<User>): Observable<User> {
    return this.api.patch<User>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
