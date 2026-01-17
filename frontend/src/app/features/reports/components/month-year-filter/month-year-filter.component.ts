import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'fit-flow-month-year-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './month-year-filter.component.html',
  styleUrl: './month-year-filter.component.scss',
})
export class MonthYearFilterComponent {
  @Output() filtersApplied = new EventEmitter<{ month?: number; year?: number }>();

  readonly selectedMonth = signal<number>(new Date().getMonth() + 1);
  readonly selectedYear = signal<number>(new Date().getFullYear());

  readonly months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  readonly years: number[];

  constructor() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  onMonthChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedMonth.set(parseInt(value, 10));
    this.applyFilters();
  }

  onYearChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedYear.set(parseInt(value, 10));
    this.applyFilters();
  }

  applyFilters(): void {
    this.filtersApplied.emit({
      month: this.selectedMonth(),
      year: this.selectedYear(),
    });
  }
}
