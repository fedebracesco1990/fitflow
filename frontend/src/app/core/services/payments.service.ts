import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Payment, CreatePaymentDto, UpdatePaymentDto } from '../models';
import { PaginatedResponse } from '../models/api-response.model';

export interface PaymentsPaginationParams {
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'payments';

  getAll(params?: PaymentsPaginationParams): Observable<PaginatedResponse<Payment>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;

    return this.api.get<PaginatedResponse<Payment>>(url);
  }

  getById(id: string): Observable<Payment> {
    return this.api.get<Payment>(`${this.endpoint}/${id}`);
  }

  getByMembership(membershipId: string): Observable<Payment[]> {
    return this.api.get<Payment[]>(`${this.endpoint}/membership/${membershipId}`);
  }

  getByUser(userId: string): Observable<Payment[]> {
    return this.api.get<Payment[]>(`${this.endpoint}/user/${userId}`);
  }

  getCurrentMonth(): Observable<Payment[]> {
    return this.api.get<Payment[]>(`${this.endpoint}/current-month`);
  }

  create(data: CreatePaymentDto): Observable<Payment> {
    return this.api.post<Payment>(this.endpoint, data);
  }

  update(id: string, data: UpdatePaymentDto): Observable<Payment> {
    return this.api.patch<Payment>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
