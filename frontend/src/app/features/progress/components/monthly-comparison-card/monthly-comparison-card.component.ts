import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { MonthlyComparison } from '../../../../core/models';

@Component({
  selector: 'fit-flow-monthly-comparison-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (data) {
      <div class="comparison-grid">
        <div class="stat-card">
          <div class="stat-header">
            <lucide-icon name="dumbbell" [size]="20"></lucide-icon>
            <span>Entrenamientos</span>
          </div>
          <div class="stat-value">{{ data.currentMonth.totalWorkouts }}</div>
          <div class="stat-change" [class]="getChangeClass(data.changes.workoutsChange)">
            <lucide-icon
              [name]="data.changes.workoutsChange >= 0 ? 'trending-up' : 'trending-down'"
              [size]="14"
            ></lucide-icon>
            {{ formatChange(data.changes.workoutsChange) }}
            <span class="percent">({{ formatPercent(data.changes.workoutsChangePercent) }})</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <lucide-icon name="weight" [size]="20"></lucide-icon>
            <span>Volumen Total</span>
          </div>
          <div class="stat-value">{{ formatVolume(data.currentMonth.totalVolume) }}</div>
          <div class="stat-change" [class]="getChangeClass(data.changes.volumeChange)">
            <lucide-icon
              [name]="data.changes.volumeChange >= 0 ? 'trending-up' : 'trending-down'"
              [size]="14"
            ></lucide-icon>
            {{ formatChange(data.changes.volumeChange) }} kg
            <span class="percent">({{ formatPercent(data.changes.volumeChangePercent) }})</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <lucide-icon name="layers" [size]="20"></lucide-icon>
            <span>Series Totales</span>
          </div>
          <div class="stat-value">{{ data.currentMonth.totalSets }}</div>
          <div class="stat-change" [class]="getChangeClass(data.changes.setsChange)">
            <lucide-icon
              [name]="data.changes.setsChange >= 0 ? 'trending-up' : 'trending-down'"
              [size]="14"
            ></lucide-icon>
            {{ formatChange(data.changes.setsChange) }}
            <span class="percent">({{ formatPercent(data.changes.setsChangePercent) }})</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <lucide-icon name="trophy" [size]="20"></lucide-icon>
            <span>Récords Personales</span>
          </div>
          <div class="stat-value">{{ data.currentMonth.personalRecords }}</div>
          <div class="stat-label">este mes</div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .comparison-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #e5e7eb;
      }

      .stat-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #6b7280;
        font-size: 13px;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .stat-change {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 500;

        &.positive {
          color: #10b981;
        }

        &.negative {
          color: #ef4444;
        }

        &.neutral {
          color: #6b7280;
        }

        .percent {
          color: #9ca3af;
          font-weight: 400;
        }
      }

      .stat-label {
        font-size: 12px;
        color: #9ca3af;
      }
    `,
  ],
})
export class MonthlyComparisonCardComponent {
  @Input() data: MonthlyComparison | null = null;

  getChangeClass(change: number): string {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  }

  formatChange(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}`;
  }

  formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  formatVolume(value: number): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k kg`;
    }
    return `${value.toLocaleString()} kg`;
  }
}
