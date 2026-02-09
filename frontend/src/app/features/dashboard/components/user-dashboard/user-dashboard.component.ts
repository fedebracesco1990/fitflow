import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { Store } from '@ngxs/store';
import { UserState } from '../../../../core/store';
import { StatsService } from '../../../../core/services';
import { MonthlyComparison } from '../../../../core/models';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { CardComponent } from '../../../../shared';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-user-dashboard',
  standalone: true,
  imports: [DatePipe, StatCardComponent, CardComponent, LucideAngularModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly statsService = inject(StatsService);

  readonly profile = this.store.selectSignal(UserState.profile);
  readonly isLoading = signal(true);
  readonly monthlyStats = signal<MonthlyComparison | null>(null);

  readonly membershipStatus = computed(() => {
    const p = this.profile();
    if (!p?.memberships?.length) return null;
    const active = p.memberships.find((m) => m.status === 'active');
    return active ?? null;
  });

  readonly daysUntilExpiration = computed(() => {
    const membership = this.membershipStatus();
    if (!membership?.endDate) return null;
    const end = new Date(membership.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    this.statsService
      .getMyMonthlyComparison()
      .pipe(catchError(() => of(null)))
      .subscribe((stats) => {
        this.monthlyStats.set(stats);
        this.isLoading.set(false);
      });
  }
}
