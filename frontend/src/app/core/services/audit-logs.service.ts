import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuditAction, AuditLog } from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface AuditLogsFilterParams {
  page?: number;
  limit?: number;
  entity?: string;
  action?: AuditAction;
  performedById?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'audit-logs';

  getAll(params?: AuditLogsFilterParams): Observable<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.entity) queryParams.set('entity', params.entity);
    if (params?.action) queryParams.set('action', params.action);
    if (params?.performedById) queryParams.set('performedById', params.performedById);

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;

    return this.api.get<PaginatedResponse<AuditLog>>(url);
  }
}
