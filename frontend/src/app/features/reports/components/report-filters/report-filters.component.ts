import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-report-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  templateUrl: './report-filters.component.html',
  styleUrl: './report-filters.component.scss',
})
export class ReportFiltersComponent {
  @Output() filtersApplied = new EventEmitter<{ startDate?: string; endDate?: string }>();
  @Output() clearFilters = new EventEmitter<void>();

  startDate = '';
  endDate = '';

  applyFilters(): void {
    this.filtersApplied.emit({
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
    });
  }

  clear(): void {
    this.startDate = '';
    this.endDate = '';
    this.clearFilters.emit();
  }
}
