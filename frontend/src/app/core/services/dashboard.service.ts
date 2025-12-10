import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FinancialDashboard } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly api = inject(ApiService);

  getFinancialDashboard(): Observable<FinancialDashboard> {
    return this.api.get<FinancialDashboard>('dashboard/financial');
  }
}
