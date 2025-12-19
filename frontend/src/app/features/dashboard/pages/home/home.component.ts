import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { RouterLink } from '@angular/router';
import { AuthState, UserState, LoadProfile } from '../../../../core/store';
import { DashboardService, NetworkService } from '../../../../core/services';
import { AlertComponent, ButtonComponent, CardComponent } from '../../../../shared';
import { Role, FinancialDashboard } from '../../../../core/models';
import { LucideAngularModule } from 'lucide-angular';
import { ActivityLiveComponent } from '../../components/activity-live/activity-live.component';
import { RecentPaymentsComponent } from '../../components/recent-payments/recent-payments.component';

@Component({
  selector: 'fit-flow-home',
  standalone: true,
  imports: [
    AlertComponent,
    ButtonComponent,
    CardComponent,
    RouterLink,
    LucideAngularModule,
    ActivityLiveComponent,
    RecentPaymentsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dashboardService = inject(DashboardService);
  readonly network = inject(NetworkService);

  // Dashboard stats
  readonly dashboardStats = signal<FinancialDashboard | null>(null);
  readonly isLoadingStats = signal(false);

  readonly user = this.store.selectSignal(AuthState.user);
  readonly profile = this.store.selectSignal(UserState.profile);
  readonly userRole = this.store.selectSignal(AuthState.userRole);

  // Role checks
  readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);
  readonly isTrainer = this.store.selectSignal(AuthState.isTrainer);
  readonly isUser = computed(() => this.userRole() === Role.USER);

  // Computed properties for template
  readonly welcomeName = computed(() => this.profile()?.name || this.user()?.email || 'Usuario');

  readonly roleLabel = computed(() => {
    switch (this.userRole()) {
      case Role.ADMIN:
        return 'Administrador';
      case Role.TRAINER:
        return 'Entrenador';
      default:
        return 'Usuario';
    }
  });

  ngOnInit(): void {
    if (!this.profile()) {
      this.store.dispatch(new LoadProfile());
    }
    if (this.isAdmin()) {
      this.loadDashboardStats();
    }
  }

  private loadDashboardStats(): void {
    this.isLoadingStats.set(true);
    this.dashboardService.getFinancialDashboard().subscribe({
      next: (data) => {
        this.dashboardStats.set(data);
        this.isLoadingStats.set(false);
      },
      error: () => {
        this.isLoadingStats.set(false);
      },
    });
  }
}
