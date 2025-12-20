import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FinancialDashboard, DashboardStats } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('dashboard/stats');
  }

  getFinancialDashboard(): Observable<FinancialDashboard> {
    return this.api.get<FinancialDashboard>('dashboard/financial');
  }
}
