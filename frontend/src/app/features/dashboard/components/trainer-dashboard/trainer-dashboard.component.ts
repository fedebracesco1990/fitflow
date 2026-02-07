import { Component, input } from '@angular/core';
import { TrainerDashboard } from '../../../../core/models';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { StudentsListComponent } from '../../widgets/students-list/students-list.component';
import { ActivityLiveComponent } from '../activity-live/activity-live.component';

@Component({
  selector: 'fit-flow-trainer-dashboard',
  standalone: true,
  imports: [StatCardComponent, StudentsListComponent, ActivityLiveComponent],
  templateUrl: './trainer-dashboard.component.html',
  styleUrl: './trainer-dashboard.component.scss',
})
export class TrainerDashboardComponent {
  readonly data = input.required<TrainerDashboard>();
  readonly isLoading = input<boolean>(false);
}
