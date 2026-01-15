import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface SearchUsersParams {
  search?: string;
  role?: string;
  membershipStatus?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(params?: SearchUsersParams): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.membershipStatus)
      httpParams = httpParams.set('membershipStatus', params.membershipStatus);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<PaginatedResponse<User>>(`${this.baseUrl}/users`, { params: httpParams });
  }

  exportMembers(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/users/export`, { responseType: 'blob' });
  }
}
