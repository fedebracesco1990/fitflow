import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { WorkoutsService } from '../../../../core/services';
import { WorkoutLog } from '../../../../core/models';
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
                <div class="history-card">
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

    .card-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 14px;
      color: #475569;
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
    return log.exerciseLogs?.length || 0;
  }
}
