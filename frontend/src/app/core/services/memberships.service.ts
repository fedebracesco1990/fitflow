import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PaginatedResponse } from '../models/api-response.model';
import { Membership } from '../models/membership.model';

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

  getActiveByUser(userId: string): Observable<Membership | null> {
    return this.api.get<Membership | null>(`${this.endpoint}/user/${userId}/active`);
  }

  getExpiring(days = 7): Observable<Membership[]> {
    return this.api.get<Membership[]>(`${this.endpoint}/expiring?days=${days}`);
  }
}
