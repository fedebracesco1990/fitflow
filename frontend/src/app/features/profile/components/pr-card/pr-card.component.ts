import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PersonalRecord } from '../../../../core/models';

@Component({
  selector: 'fit-flow-pr-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DatePipe],
  template: `
    <div class="pr-card">
      <div class="pr-header">
        <lucide-icon name="trophy" [size]="20" class="trophy-icon"></lucide-icon>
        <h3 class="exercise-name">{{ record().exercise?.name || 'Ejercicio' }}</h3>
      </div>

      <div class="pr-stats">
        @if (record().maxWeight) {
          <div class="stat-group">
            <span class="stat-label">Peso Máximo</span>
            <div class="stat-value">
              <span class="value">{{ record().maxWeight }}</span>
              <span class="unit">kg</span>
              @if (record().maxWeightReps) {
                <span class="reps">× {{ record().maxWeightReps }} reps</span>
              }
            </div>
            @if (record().maxWeightAchievedAt) {
              <span class="stat-date">{{ record().maxWeightAchievedAt | date: 'dd/MM/yyyy' }}</span>
            }
          </div>
        }

        @if (record().maxVolume) {
          <div class="stat-group">
            <span class="stat-label">Volumen Máximo</span>
            <div class="stat-value">
              <span class="value">{{ record().maxVolume }}</span>
              <span class="unit">kg total</span>
            </div>
            @if (record().maxVolumeAchievedAt) {
              <span class="stat-date">{{ record().maxVolumeAchievedAt | date: 'dd/MM/yyyy' }}</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .pr-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition:
        transform 0.2s,
        box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .pr-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .trophy-icon {
      color: #f59e0b;
    }

    .exercise-name {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .pr-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .stat-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .unit {
      font-size: 14px;
      color: #64748b;
    }

    .reps {
      font-size: 14px;
      color: #6366f1;
      font-weight: 500;
    }

    .stat-date {
      font-size: 12px;
      color: #94a3b8;
    }
  `,
})
export class PrCardComponent {
  record = input.required<PersonalRecord>();
}
