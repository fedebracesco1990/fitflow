import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Store } from '@ngxs/store';
import { UserState } from '../../../../core/store';
import { UserRoutinesService, StatsService } from '../../../../core/services';
import { TodayRoutineResponse, MonthlyComparison } from '../../../../core/models';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { QuickActionsComponent, QuickAction } from '../../widgets/quick-actions/quick-actions.component';
import { CardComponent } from '../../../../shared';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'fit-flow-user-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    StatCardComponent,
    QuickActionsComponent,
    CardComponent,
    LucideAngularModule,
    RouterLink,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly userRoutinesService = inject(UserRoutinesService);
  private readonly statsService = inject(StatsService);

  readonly profile = this.store.selectSignal(UserState.profile);
  readonly isLoading = signal(true);
  readonly todayRoutine = signal<TodayRoutineResponse | null>(null);
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

  readonly quickActions: QuickAction[] = [
    { label: 'Mi Rutina de Hoy', icon: 'dumbbell', route: '/my-routines/today' },
    { label: 'Mi Semana', icon: 'calendar', route: '/my-routines' },
    { label: 'Mi Progreso', icon: 'trending-up', route: '/my-progress' },
    { label: 'Mi QR', icon: 'qr-code', route: '/profile/qr' },
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      todayRoutine: this.userRoutinesService.getToday(),
      monthlyStats: this.statsService.getMyMonthlyComparison(),
    }).subscribe({
      next: ({ todayRoutine, monthlyStats }) => {
        this.todayRoutine.set(todayRoutine);
        this.monthlyStats.set(monthlyStats);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
