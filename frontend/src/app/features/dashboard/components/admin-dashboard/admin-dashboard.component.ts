import { Component, input, inject, signal } from '@angular/core';
import { AdminDashboard } from '../../../../core/models';
import { UsersService } from '../../../../core/services';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import {
  QuickActionsComponent,
  QuickAction,
} from '../../widgets/quick-actions/quick-actions.component';
import { ActivityLiveComponent } from '../activity-live/activity-live.component';
import { RecentPaymentsComponent } from '../recent-payments/recent-payments.component';
import { RetentionAlertWidgetComponent } from '../../widgets/retention-alert/retention-alert-widget.component';

@Component({
  selector: 'fit-flow-admin-dashboard',
  standalone: true,
  imports: [
    StatCardComponent,
    QuickActionsComponent,
    ActivityLiveComponent,
    RecentPaymentsComponent,
    RetentionAlertWidgetComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly usersService = inject(UsersService);

  readonly data = input.required<AdminDashboard>();
  readonly isLoading = input<boolean>(false);
  readonly isExporting = signal(false);

  readonly quickActions: QuickAction[] = [
    { label: 'Directorio de Usuarios', icon: 'users', route: '/memberships' },
    { label: '+ Nuevo Miembro', icon: 'user-plus', route: '/memberships/new' },
    { label: '$ Nuevo Pago', icon: 'dollar-sign', route: '/payments/new' },
    { label: 'Check-in', icon: 'scan', route: '/access/scan' },
  ];

  exportMembers(): void {
    this.isExporting.set(true);
    this.usersService.exportMembers().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `miembros-fitflow-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => {
        this.isExporting.set(false);
      },
    });
  }
}
