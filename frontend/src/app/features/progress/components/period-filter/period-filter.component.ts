import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PeriodRange {
  startDate: string;
  endDate: string;
  label: string;
}

type PeriodOption = '7d' | '30d' | '90d' | '1y' | 'all';

@Component({
  selector: 'fit-flow-period-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="period-filter">
      <div class="filter-buttons">
        @for (option of periodOptions; track option.value) {
          <button
            type="button"
            class="filter-btn"
            [class.active]="selectedPeriod() === option.value"
            (click)="selectPeriod(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .period-filter {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .filter-buttons {
        display: flex;
        gap: 4px;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 8px;
      }

      .filter-btn {
        padding: 6px 12px;
        border: none;
        background: transparent;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #1e293b;
        }

        &.active {
          background: white;
          color: #6366f1;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      }
    `,
  ],
})
export class PeriodFilterComponent {
  @Output() periodChange = new EventEmitter<PeriodRange>();

  readonly selectedPeriod = signal<PeriodOption>('30d');

  readonly periodOptions: { value: PeriodOption; label: string; days: number | null }[] = [
    { value: '7d', label: '7 días', days: 7 },
    { value: '30d', label: '30 días', days: 30 },
    { value: '90d', label: '90 días', days: 90 },
    { value: '1y', label: '1 año', days: 365 },
    { value: 'all', label: 'Todo', days: null },
  ];

  selectPeriod(period: PeriodOption): void {
    this.selectedPeriod.set(period);
    const range = this.calculateDateRange(period);
    this.periodChange.emit(range);
  }

  private calculateDateRange(period: PeriodOption): PeriodRange {
    const endDate = new Date();
    const option = this.periodOptions.find((o) => o.value === period);

    if (!option?.days) {
      return {
        startDate: '',
        endDate: '',
        label: 'Todo',
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - option.days);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      label: option.label,
    };
  }
}
