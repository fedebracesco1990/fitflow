import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  MembershipType,
  CreateMembershipTypeRequest,
  UpdateMembershipTypeRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class MembershipTypesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'membership-types';

  getAll(includeInactive = false): Observable<MembershipType[]> {
    return this.api.get<MembershipType[]>(this.endpoint, { includeInactive });
  }

  getById(id: string): Observable<MembershipType> {
    return this.api.get<MembershipType>(`${this.endpoint}/${id}`);
  }

  create(data: CreateMembershipTypeRequest): Observable<MembershipType> {
    return this.api.post<MembershipType>(this.endpoint, data);
  }

  update(id: string, data: UpdateMembershipTypeRequest): Observable<MembershipType> {
    return this.api.patch<MembershipType>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
