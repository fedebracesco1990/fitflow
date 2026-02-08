import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OfflineProgramsService, MyProgramResponse } from '../../../../core/services';
import { UserProgramRoutine } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-workout-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './workout-list.component.html',
  styleUrl: './workout-list.component.scss',
})
export class WorkoutListComponent implements OnInit {
  private readonly offlineProgramsService = inject(OfflineProgramsService);
  private readonly router = inject(Router);

  program = signal<MyProgramResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProgram();
  }

  loadProgram(): void {
    this.loading.set(true);
    this.error.set(null);

    this.offlineProgramsService.getMyProgram().subscribe({
      next: (data) => {
        this.program.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar tu programa');
        this.loading.set(false);
      },
    });
  }

  get routines(): UserProgramRoutine[] {
    return this.program()?.routines || [];
  }

  getRoutineStatusClass(routine: UserProgramRoutine): string {
    return routine.lastCompletedAt ? 'completed' : 'pending';
  }

  getStatusText(routine: UserProgramRoutine): string {
    if (routine.lastCompletedAt) {
      return `Última vez: ${this.formatDate(routine.lastCompletedAt)}`;
    }
    return 'Pendiente';
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy ${date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
    }
  }

  isRoutineCompleted(routine: UserProgramRoutine): boolean {
    return !!routine.lastCompletedAt;
  }

  startWorkout(routine: UserProgramRoutine): void {
    this.router.navigate(['/my-routines', routine.id, 'start']);
  }

  goToHistory(): void {
    this.router.navigate(['/my-routines/history']);
  }
}
