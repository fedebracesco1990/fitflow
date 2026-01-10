import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { UserRoutinesService } from '../../../../core/services';
import {
  DayOfWeek,
  DayOfWeekLabels,
  UserRoutine,
  TodayRoutineResponse,
  ExerciseWithHistory,
  DifficultyLabels,
} from '../../../../core/models';
import { getCurrentDayOfWeek } from '../../../../core/utils';
import { DayNavigatorComponent } from '../../components/day-navigator/day-navigator.component';
import { ExerciseCardComponent } from '../../components/exercise-card/exercise-card.component';

@Component({
  selector: 'fit-flow-today-routine',
  standalone: true,
  imports: [CommonModule, DayNavigatorComponent, ExerciseCardComponent],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss',
})
export class TodayRoutineComponent implements OnInit {
  private readonly userRoutinesService = inject(UserRoutinesService);
  private readonly router = inject(Router);

  weekData = signal<Record<DayOfWeek, UserRoutine[]> | null>(null);
  todayData = signal<TodayRoutineResponse | null>(null);
  selectedDay = signal<DayOfWeek>(getCurrentDayOfWeek());
  loading = signal(true);
  error = signal<string | null>(null);

  readonly today = getCurrentDayOfWeek();
  readonly dayLabels = DayOfWeekLabels;
  readonly difficultyLabels = DifficultyLabels;

  currentRoutine = computed(() => {
    const week = this.weekData();
    const selected = this.selectedDay();
    if (!week) return null;
    return week[selected]?.[0] || null;
  });

  currentExercises = computed<ExerciseWithHistory[]>(() => {
    const selected = this.selectedDay();
    const todayDow = this.today;

    if (selected === todayDow) {
      const todayResponse = this.todayData();
      return todayResponse?.exercises || [];
    }

    const routine = this.currentRoutine();
    if (!routine?.routine?.exercises) return [];

    return routine.routine.exercises.map((re) => ({
      id: re.id,
      routineId: re.routineId,
      exerciseId: re.exerciseId,
      exercise: {
        id: re.exercise.id,
        name: re.exercise.name,
        description: re.exercise.description || null,
        muscleGroupId: re.exercise.muscleGroupId || null,
        imageUrl: re.exercise.imageUrl || null,
        videoUrl: re.exercise.videoUrl || null,
      },
      order: re.order,
      sets: re.sets,
      reps: re.reps,
      restSeconds: re.restSeconds,
      notes: re.notes,
      suggestedWeight: re.suggestedWeight,
      dayOfWeek: re.dayOfWeek,
      lastWorkout: null,
    }));
  });

  isToday = computed(() => this.selectedDay() === this.today);

  hasRoutineForSelectedDay = computed(() => {
    const week = this.weekData();
    const selected = this.selectedDay();
    return !!week && week[selected]?.length > 0;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      week: this.userRoutinesService.getMyWeek(),
      today: this.userRoutinesService.getToday(),
    }).subscribe({
      next: ({ week, today }) => {
        this.weekData.set(week);
        this.todayData.set(today);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar tus rutinas');
        this.loading.set(false);
      },
    });
  }

  onDayChange(day: DayOfWeek): void {
    this.selectedDay.set(day);
  }

  startWorkout(): void {
    const routine = this.currentRoutine();
    if (!routine) return;

    this.router.navigate(['/my-routines', routine.id, 'start']);
  }

  goToWeekView(): void {
    this.router.navigate(['/my-routines/week']);
  }
}
