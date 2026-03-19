import { Component, input, inject } from '@angular/core';
import { AdminDashboard } from '../../../../core/models';
import { UsersService } from '../../../../core/services';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { ActivityLiveComponent } from '../activity-live/activity-live.component';
import { RecentPaymentsComponent } from '../recent-payments/recent-payments.component';
import { RetentionAlertWidgetComponent } from '../../widgets/retention-alert/retention-alert-widget.component';
import { AuditLogsWidgetComponent } from '../../widgets/audit-logs-widget/audit-logs-widget.component';

@Component({
  selector: 'fit-flow-admin-dashboard',
  standalone: true,
  imports: [
    StatCardComponent,
    ActivityLiveComponent,
    RecentPaymentsComponent,
    RetentionAlertWidgetComponent,
    AuditLogsWidgetComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly usersService = inject(UsersService);

  readonly data = input.required<AdminDashboard>();
  readonly isLoading = input<boolean>(false);
}
