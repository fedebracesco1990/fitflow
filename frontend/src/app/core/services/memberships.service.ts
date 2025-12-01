import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  GRACE_PERIOD = 'grace_period',
}

export const MembershipStatusLabels: Record<MembershipStatus, string> = {
  [MembershipStatus.ACTIVE]: 'Activa',
  [MembershipStatus.EXPIRED]: 'Vencida',
  [MembershipStatus.CANCELLED]: 'Cancelada',
  [MembershipStatus.GRACE_PERIOD]: 'En gracia',
};

export interface Membership {
  id: string;
  userId: string;
  membershipTypeId: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  notes: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  membershipType?: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MembershipsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/memberships';

  getAll(): Observable<Membership[]> {
    return this.api.get<Membership[]>(this.endpoint);
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
