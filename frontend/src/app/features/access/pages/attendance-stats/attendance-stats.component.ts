import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService, AttendanceStats } from '../../../../core/services';
import { CardComponent, LoadingSpinnerComponent, AlertComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-attendance-stats',
  standalone: true,
  imports: [CommonModule, CardComponent, LoadingSpinnerComponent, AlertComponent],
  templateUrl: './attendance-stats.component.html',
  styleUrl: './attendance-stats.component.scss',
})
export class AttendanceStatsComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly stats = signal<AttendanceStats | null>(null);

  readonly totalAttendances = computed(() => this.stats()?.totalAttendances ?? 0);
  readonly byDayOfWeek = computed(() => this.stats()?.byDayOfWeek ?? []);
  readonly monthlyAverages = computed(() => this.stats()?.monthlyAverages ?? []);

  readonly dayChartMax = computed(() => {
    const days = this.byDayOfWeek();
    if (days.length === 0) return 10;
    return Math.max(...days.map((d) => d.count)) * 1.1;
  });

  readonly monthChartMax = computed(() => {
    const months = this.monthlyAverages();
    if (months.length === 0) return 10;
    return Math.max(...months.map((m) => m.totalAttendances)) * 1.1;
  });

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set(null);

    this.attendanceService.getStats().subscribe({
      next: (response) => {
        this.stats.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar las estadísticas');
        this.loading.set(false);
      },
    });
  }

  getDayBarHeight(count: number): string {
    const max = this.dayChartMax();
    const percentage = (count / max) * 100;
    return `${Math.max(percentage, 5)}%`;
  }

  getMonthBarHeight(total: number): string {
    const max = this.monthChartMax();
    const percentage = (total / max) * 100;
    return `${Math.max(percentage, 5)}%`;
  }

  getDayColor(dayOfWeek: number): string {
    const colors: Record<number, string> = {
      1: '#ef4444',
      2: '#f97316',
      3: '#eab308',
      4: '#22c55e',
      5: '#14b8a6',
      6: '#3b82f6',
      7: '#8b5cf6',
    };
    return colors[dayOfWeek] || '#6b7280';
  }
}
