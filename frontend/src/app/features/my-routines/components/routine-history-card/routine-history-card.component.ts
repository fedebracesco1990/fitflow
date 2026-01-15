import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RoutineHistoryItem, DayOfWeekLabels } from '../../../../core/models';
import { formatDateShort } from '../../../../core/utils/date.utils';
import { CardComponent, BadgeComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-routine-history-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent, BadgeComponent],
  template: `
    <fit-flow-card padding="md" class="history-card">
      <div class="card-header">
        <h3 class="routine-name">{{ item().routineName }}</h3>
        <fit-flow-badge variant="neutral">
          {{ dayLabels[item().dayOfWeek] }}
        </fit-flow-badge>
      </div>

      @if (item().routineDescription) {
        <p class="routine-description">{{ item().routineDescription }}</p>
      }

      <div class="stats-grid">
        <div class="stat">
          <lucide-icon name="calendar" [size]="18"></lucide-icon>
          <div class="stat-content">
            <span class="stat-value">{{ formatDateShort(item().startDate) }}</span>
            <span class="stat-label">Inicio</span>
          </div>
        </div>

        @if (item().endDate) {
          <div class="stat">
            <lucide-icon name="calendar-x" [size]="18"></lucide-icon>
            <div class="stat-content">
              <span class="stat-value">{{ formatDateShort(item().endDate!) }}</span>
              <span class="stat-label">Fin</span>
            </div>
          </div>
        }

        @if (item().durationDays !== null) {
          <div class="stat">
            <lucide-icon name="clock" [size]="18"></lucide-icon>
            <div class="stat-content">
              <span class="stat-value">{{ item().durationDays }} días</span>
              <span class="stat-label">Duración</span>
            </div>
          </div>
        }

        <div class="stat highlight">
          <lucide-icon name="dumbbell" [size]="18"></lucide-icon>
          <div class="stat-content">
            <span class="stat-value">{{ item().workoutsCompleted }}</span>
            <span class="stat-label">Entrenamientos</span>
          </div>
        </div>
      </div>
    </fit-flow-card>
  `,
  styles: `
    .history-card {
      height: 100%;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
    }

    .routine-name {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.3;
    }

    .routine-description {
      margin: 0 0 12px;
      font-size: 14px;
      color: #64748b;
      line-height: 1.4;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: #64748b;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .stat-label {
      font-size: 12px;
      color: #94a3b8;
    }

    .stat.highlight {
      color: #6366f1;
    }

    .stat.highlight .stat-value {
      color: #6366f1;
    }
  `,
})
export class RoutineHistoryCardComponent {
  item = input.required<RoutineHistoryItem>();

  readonly dayLabels = DayOfWeekLabels;
  readonly formatDateShort = formatDateShort;
}
