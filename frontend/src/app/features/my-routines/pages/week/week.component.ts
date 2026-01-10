import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserRoutinesService } from '../../../../core/services';
import { UserRoutine, DayOfWeek, DayOfWeekLabels, DifficultyLabels } from '../../../../core/models';
import { getCurrentDayOfWeek } from '../../../../core/utils';

@Component({
  selector: 'fit-flow-my-week',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './week.component.html',
  styleUrl: './week.component.scss',
})
export class MyWeekComponent implements OnInit {
  private readonly userRoutinesService = inject(UserRoutinesService);

  weekRoutines = signal<Record<DayOfWeek, UserRoutine[]> | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  days = Object.values(DayOfWeek);
  dayLabels = DayOfWeekLabels;
  difficultyLabels = DifficultyLabels;

  today = getCurrentDayOfWeek();

  ngOnInit(): void {
    this.loadMyWeek();
  }

  loadMyWeek(): void {
    this.loading.set(true);
    this.userRoutinesService.getMyWeek().subscribe({
      next: (week) => {
        this.weekRoutines.set(week);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar tus rutinas');
        this.loading.set(false);
      },
    });
  }
}
