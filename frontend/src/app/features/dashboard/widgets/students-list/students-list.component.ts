import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent, BadgeComponent } from '../../../../shared';
import { TrainerStudentSummary } from '../../../../core/models';

@Component({
  selector: 'fit-flow-students-list',
  standalone: true,
  imports: [CardComponent, BadgeComponent, LucideAngularModule],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss',
})
export class StudentsListComponent {
  readonly title = input<string>('👥 Mis Alumnos Recientes');
  readonly students = input.required<TrainerStudentSummary[]>();
  readonly isLoading = input<boolean>(false);

  formatLastActivity(date: string | null): string {
    if (!date) return 'Sin actividad';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return new Date(date).toLocaleDateString('es-ES');
  }
}
