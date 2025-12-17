import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ValidateQrResponse {
  granted: boolean;
  reason: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  membership: {
    id: string;
    status: string;
    endDate: string;
    typeName: string;
  } | null;
}

export interface AccessLog {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  scannedById: string;
  scannedBy: {
    id: string;
    name: string;
  };
  granted: boolean;
  reason: string | null;
  createdAt: string;
}

export interface AccessLogsResponse {
  data: AccessLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AccessLogsParams {
  userId?: string;
  fromDate?: string;
  toDate?: string;
  granted?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/access`;

  validateQr(token: string): Observable<ValidateQrResponse> {
    return this.http.post<ValidateQrResponse>(`${this.baseUrl}/validate-qr`, { token });
  }

  getAccessLogs(params?: AccessLogsParams): Observable<AccessLogsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.userId) queryParams.set('userId', params.userId);
    if (params?.fromDate) queryParams.set('fromDate', params.fromDate);
    if (params?.toDate) queryParams.set('toDate', params.toDate);
    if (params?.granted !== undefined) queryParams.set('granted', String(params.granted));
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));

    const query = queryParams.toString();
    const url = query ? `${this.baseUrl}/logs?${query}` : `${this.baseUrl}/logs`;

    return this.http.get<AccessLogsResponse>(url);
  }
}
