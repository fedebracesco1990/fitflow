import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { UserState } from '../../../../core/store/user/user.state';
import { AttendanceService, MonthlyAverage } from '../../../../core/services';
import {
  CardComponent,
  LoadingSpinnerComponent,
  AlertComponent,
  AttendanceCalendarComponent,
} from '../../../../shared';

@Component({
  selector: 'fit-flow-my-attendance',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    AttendanceCalendarComponent,
  ],
  templateUrl: './my-attendance.component.html',
  styleUrl: './my-attendance.component.scss',
})
export class MyAttendanceComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly attendanceService = inject(AttendanceService);

  readonly profile = this.store.selectSignal(UserState.profile);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly monthlyCount = signal(0);
  readonly currentMonth = signal(new Date().getMonth() + 1);
  readonly currentYear = signal(new Date().getFullYear());
  readonly attendanceDates = signal<Date[]>([]);
  readonly monthlyAverages = signal<MonthlyAverage[]>([]);

  readonly chartMaxValue = computed(() => {
    const averages = this.monthlyAverages();
    if (averages.length === 0) return 10;
    return Math.max(...averages.map((a) => a.totalAttendances)) * 1.1;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const userId = this.profile()?.id;
    if (!userId) {
      this.error.set('No se pudo obtener el perfil del usuario');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.attendanceService.getMyMonthlyCount(userId).subscribe({
      next: (response) => {
        this.monthlyCount.set(response.count);
        this.currentMonth.set(response.month);
        this.currentYear.set(response.year);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar el conteo mensual');
      },
    });

    this.attendanceService.getMyAttendance(userId, { limit: 100 }).subscribe({
      next: (response) => {
        const dates = response.data.filter((r) => r.granted).map((r) => new Date(r.createdAt));
        this.attendanceDates.set(dates);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar el historial');
        this.loading.set(false);
      },
    });

    this.attendanceService.getStats().subscribe({
      next: (response) => {
        this.monthlyAverages.set(response.monthlyAverages);
      },
      error: () => {
        // Stats are optional, ignore errors
      },
    });
  }

  getBarHeight(total: number): string {
    const max = this.chartMaxValue();
    const percentage = (total / max) * 100;
    return `${Math.max(percentage, 5)}%`;
  }

  getMonthName(): string {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return monthNames[this.currentMonth() - 1];
  }
}
