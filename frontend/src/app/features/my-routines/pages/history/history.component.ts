import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { WorkoutsService } from '../../../../core/services';
import { WorkoutLog, ExerciseLog } from '../../../../core/models';
import { CardComponent, LoadingSpinnerComponent, EmptyStateComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-routine-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    CardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="history-page">
      <div class="page-header">
        <a routerLink="/my-routines" class="back-link">
          <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
          Volver a Rutinas
        </a>
        <h1>Historial de Rutinas</h1>
        <p class="subtitle">Rutinas que has completado anteriormente</p>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <fit-flow-loading-spinner size="lg" />
        </div>
      } @else if (error()) {
        <fit-flow-card padding="md">
          <div class="error-state">
            <lucide-icon name="alert-circle" [size]="32"></lucide-icon>
            <p>{{ error() }}</p>
            <button class="retry-button" (click)="loadHistory()">Reintentar</button>
          </div>
        </fit-flow-card>
      } @else {
        @if (totalWorkouts() > 0) {
          <section class="stats-section">
            <fit-flow-card padding="md">
              <div class="stats-row">
                <div class="stat">
                  <span class="stat-value">{{ totalWorkouts() }}</span>
                  <span class="stat-label">Sesiones Totales</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ completedWorkouts() }}</span>
                  <span class="stat-label">Completadas</span>
                </div>
              </div>
            </fit-flow-card>
          </section>
        }

        <section class="history-section">
          @if (history().length === 0) {
            <fit-flow-empty-state
              icon="history"
              title="Sin historial aún"
              description="Cuando completes rutinas, aparecerán aquí para que puedas ver tu progreso"
            />
          } @else {
            <div class="history-grid">
              @for (item of history(); track item.id) {
                <div
                  class="history-card"
                  (click)="openDetail(item)"
                  (keydown.enter)="openDetail(item)"
                  tabindex="0"
                  role="button"
                >
                  <div class="card-header">
                    <h3>{{ getRoutineName(item) }}</h3>
                    <span class="date">{{ formatDate(item.createdAt) }}</span>
                  </div>
                  <div class="card-stats">
                    <span>⏱️ {{ formatTime(item.duration) }}</span>
                    <span>✓ {{ getExerciseCount(item) }} ejercicios</span>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      }
    </div>

    @if (selectedWorkout()) {
      <div
        class="dialog-backdrop"
        (click)="onBackdropClick($event)"
        (keydown.escape)="closeDetail()"
        tabindex="-1"
      >
        <div class="dialog" role="dialog" aria-modal="true">
          <div class="dialog-header">
            <div>
              <h3>{{ getRoutineName(selectedWorkout()!) }}</h3>
              <span class="dialog-date"
                >{{ formatDate(selectedWorkout()!.createdAt) }} · ⏱️
                {{ formatTime(selectedWorkout()!.duration) }}</span
              >
            </div>
            <button class="close-btn" (click)="closeDetail()" aria-label="Cerrar">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>
          <div class="dialog-body">
            @for (group of getGroupedExercises(selectedWorkout()!); track group.exerciseId) {
              <div class="exercise-group">
                <span class="exercise-name">{{ group.name }}</span>
                <div class="sets-list">
                  @for (set of group.sets; track set.setNumber) {
                    <div class="set-row" [class.completed]="set.completed">
                      <span class="set-number">Set {{ set.setNumber }}</span>
                      <span class="set-detail">{{ set.reps }} reps</span>
                      @if (set.weight) {
                        <span class="set-detail">{{ set.weight }} kg</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .history-page {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 12px;
      transition: color 0.2s;

      &:hover {
        color: #1e293b;
      }
    }

    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #64748b;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px;
      text-align: center;
      color: #ef4444;
    }

    .error-state p {
      margin: 0;
      color: #64748b;
    }

    .retry-button {
      padding: 8px 16px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #4f46e5;
      }
    }

    .stats-section {
      margin-bottom: 24px;
    }

    .stats-row {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #6366f1;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
    }

    .history-section {
      margin-bottom: 32px;
    }

    .history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .history-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }

      .date {
        font-size: 12px;
        color: #64748b;
      }
    }

    .history-card {
      cursor: pointer;
      transition:
        box-shadow 0.15s,
        transform 0.15s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        transform: translateY(-1px);
      }

      &:focus-visible {
        outline: 2px solid #6366f1;
        outline-offset: 2px;
      }
    }

    .card-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 14px;
      color: #475569;
    }

    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease;
    }

    .dialog {
      background: white;
      border-radius: 12px;
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 480px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.2s ease;
    }

    .dialog-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .dialog-date {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 2px;
      display: block;
    }

    .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      transition:
        color 0.15s,
        background 0.15s;
      flex-shrink: 0;

      &:hover {
        color: #1e293b;
        background: #f1f5f9;
      }
    }

    .dialog-body {
      padding: 1rem 1.5rem 1.5rem;
      overflow-y: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .exercise-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .exercise-name {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
    }

    .sets-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .set-row {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #64748b;
      padding: 3px 0;
    }

    .set-row.completed {
      color: #059669;
    }

    .set-number {
      min-width: 44px;
      font-weight: 500;
    }

    .set-detail {
      min-width: 60px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @media (max-width: 640px) {
      .history-grid {
        grid-template-columns: 1fr;
      }

      .stats-row {
        flex-direction: column;
        gap: 16px;
      }
    }
  `,
})
export class RoutineHistoryComponent implements OnInit {
  private readonly workoutsService = inject(WorkoutsService);

  history = signal<WorkoutLog[]>([]);
  totalWorkouts = signal(0);
  completedWorkouts = computed(() => this.history().length);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedWorkout = signal<WorkoutLog | null>(null);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.workoutsService.getMyHistory({ limit: 50 }).subscribe({
      next: (response) => {
        this.history.set(response.data);
        this.totalWorkouts.set(response.meta.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el historial');
        this.loading.set(false);
      },
    });
  }

  formatTime(minutes: number | null): string {
    if (!minutes) return '0:00';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRoutineName(log: WorkoutLog): string {
    return log.userProgramRoutine?.name || 'Rutina';
  }

  getExerciseCount(log: WorkoutLog): number {
    if (!log.exerciseLogs?.length) return 0;
    return new Set(log.exerciseLogs.map((e) => e.exerciseId)).size;
  }

  openDetail(workout: WorkoutLog): void {
    this.selectedWorkout.set(workout);
  }

  closeDetail(): void {
    this.selectedWorkout.set(null);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.closeDetail();
    }
  }

  getGroupedExercises(
    log: WorkoutLog
  ): { exerciseId: string; name: string; sets: ExerciseLog[] }[] {
    if (!log.exerciseLogs?.length) return [];
    const map = new Map<string, { exerciseId: string; name: string; sets: ExerciseLog[] }>();
    for (const el of log.exerciseLogs) {
      if (!map.has(el.exerciseId)) {
        map.set(el.exerciseId, {
          exerciseId: el.exerciseId,
          name: el.exercise?.name || 'Ejercicio',
          sets: [],
        });
      }
      map.get(el.exerciseId)!.sets.push(el);
    }
    for (const group of map.values()) {
      group.sets.sort((a, b) => a.setNumber - b.setNumber);
    }
    return Array.from(map.values());
  }
}
