import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState, UserState, LoadProfile } from '../../../../core/store';
import { DashboardService, NetworkService } from '../../../../core/services';
import { AlertComponent, CardComponent } from '../../../../shared';
import {
  Role,
  AdminDashboard,
  TrainerDashboard,
  UnifiedDashboard,
  isAdminDashboard,
  isTrainerDashboard,
} from '../../../../core/models';
import { AdminDashboardComponent } from '../../components/admin-dashboard/admin-dashboard.component';
import { TrainerDashboardComponent } from '../../components/trainer-dashboard/trainer-dashboard.component';
import { UserDashboardComponent } from '../../components/user-dashboard/user-dashboard.component';

@Component({
  selector: 'fit-flow-home',
  standalone: true,
  imports: [
    AlertComponent,
    CardComponent,
    AdminDashboardComponent,
    TrainerDashboardComponent,
    UserDashboardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dashboardService = inject(DashboardService);
  readonly network = inject(NetworkService);

  readonly isLoading = signal(false);
  readonly adminData = signal<AdminDashboard | null>(null);
  readonly trainerData = signal<TrainerDashboard | null>(null);

  readonly user = this.store.selectSignal(AuthState.user);
  readonly profile = this.store.selectSignal(UserState.profile);
  readonly userRole = this.store.selectSignal(AuthState.userRole);

  readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);
  readonly isTrainer = this.store.selectSignal(AuthState.isTrainer);
  readonly isUser = computed(() => this.userRole() === Role.USER);

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
    if (this.isAdmin() || this.isTrainer()) {
      this.loadUnifiedDashboard();
    }
  }

  private loadUnifiedDashboard(): void {
    this.isLoading.set(true);
    this.dashboardService.getUnifiedDashboard().subscribe({
      next: (data: UnifiedDashboard) => {
        if (isAdminDashboard(data)) {
          this.adminData.set(data);
        } else if (isTrainerDashboard(data)) {
          this.trainerData.set(data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
