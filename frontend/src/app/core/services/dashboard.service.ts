import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStats, UnifiedDashboard } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('dashboard/stats');
  }

  getUnifiedDashboard(): Observable<UnifiedDashboard> {
    return this.api.get<UnifiedDashboard>('dashboard');
  }
}
