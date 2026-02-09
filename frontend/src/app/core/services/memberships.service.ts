import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api-response.model';
import {
  Membership,
  CreateMembershipRequest,
  UpdateMembershipRequest,
} from '../models/membership.model';

export type { Membership } from '../models/membership.model';
export { MembershipStatus, MembershipStatusLabels } from '../models/membership.model';

export interface MembershipsPaginationParams {
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MembershipsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'memberships';

  getAll(params?: MembershipsPaginationParams): Observable<PaginatedResponse<Membership>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;

    return this.api.get<PaginatedResponse<Membership>>(url);
  }

  getById(id: string): Observable<Membership> {
    return this.api.get<Membership>(`${this.endpoint}/${id}`);
  }

  getByUser(userId: string): Observable<Membership[]> {
    return this.api.get<Membership[]>(`${this.endpoint}/user/${userId}`);
  }

  getPayableByUser(userId: string): Observable<Membership | null> {
    return this.api.get<Membership | null>(`${this.endpoint}/user/${userId}/active`);
  }

  getExpiring(days = 7): Observable<Membership[]> {
    return this.api.get<Membership[]>(`${this.endpoint}/expiring?days=${days}`);
  }

  create(data: CreateMembershipRequest): Observable<Membership> {
    return this.api.post<Membership>(this.endpoint, data);
  }

  update(id: string, data: UpdateMembershipRequest): Observable<Membership> {
    return this.api.patch<Membership>(`${this.endpoint}/${id}`, data);
  }

  cancel(id: string): Observable<Membership> {
    return this.api.patch<Membership>(`${this.endpoint}/${id}/cancel`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
