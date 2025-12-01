import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Payment, CreatePaymentDto, UpdatePaymentDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/payments';

  getAll(): Observable<Payment[]> {
    return this.api.get<Payment[]>(this.endpoint);
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
