import { Component, input } from '@angular/core';
import { TrainerDashboard } from '../../../../core/models';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { QuickActionsComponent, QuickAction } from '../../widgets/quick-actions/quick-actions.component';
import { StudentsListComponent } from '../../widgets/students-list/students-list.component';
import { ActivityLiveComponent } from '../activity-live/activity-live.component';

@Component({
  selector: 'fit-flow-trainer-dashboard',
  standalone: true,
  imports: [
    StatCardComponent,
    QuickActionsComponent,
    StudentsListComponent,
    ActivityLiveComponent,
  ],
  templateUrl: './trainer-dashboard.component.html',
  styleUrl: './trainer-dashboard.component.scss',
})
export class TrainerDashboardComponent {
  readonly data = input.required<TrainerDashboard>();
  readonly isLoading = input<boolean>(false);

  readonly quickActions: QuickAction[] = [
    { label: 'Crear Rutina', icon: 'clipboard-plus', route: '/routines/new' },
    { label: 'Ver Clientes', icon: 'users', route: '/training' },
    { label: 'Biblioteca Ejercicios', icon: 'dumbbell', route: '/exercises' },
    { label: 'Check-in', icon: 'scan', route: '/access/scan' },
  ];
}
