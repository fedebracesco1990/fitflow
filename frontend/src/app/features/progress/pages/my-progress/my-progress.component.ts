import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';

import { StatsService, ExercisesService } from '../../../../core/services';
import {
  ExerciseProgress,
  VolumeStats,
  MonthlyComparison,
  Exercise,
  StatsQuery,
} from '../../../../core/models';
import {
  CardComponent,
  LoadingSpinnerComponent,
  AlertComponent,
} from '../../../../shared';
import {
  ExerciseProgressChartComponent,
  VolumeChartComponent,
  MuscleGroupChartComponent,
} from '../../../../shared/charts';
import { PeriodFilterComponent, PeriodRange } from '../../components/period-filter/period-filter.component';
import { ExerciseSelectorComponent } from '../../components/exercise-selector/exercise-selector.component';
import { MonthlyComparisonCardComponent } from '../../components/monthly-comparison-card/monthly-comparison-card.component';

@Component({
  selector: 'fit-flow-my-progress',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    CardComponent,
    LoadingSpinnerComponent,
    AlertComponent,
    ExerciseProgressChartComponent,
    VolumeChartComponent,
    MuscleGroupChartComponent,
    PeriodFilterComponent,
    ExerciseSelectorComponent,
    MonthlyComparisonCardComponent,
  ],
  template: `
    <div class="progress-page">
      <div class="page-header">
        <a routerLink="/profile" class="back-link">
          <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
          Volver al perfil
        </a>
        <h1>Mi Progreso</h1>
        <p class="subtitle">Visualiza tu evolución y estadísticas de entrenamiento</p>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <fit-flow-loading-spinner size="lg" />
        </div>
      } @else if (error()) {
        <fit-flow-alert type="error" [message]="error()!" />
      } @else {
        <section class="monthly-section">
          <h2>Resumen del Mes</h2>
          <fit-flow-monthly-comparison-card [data]="monthlyComparison()" />
        </section>

        <section class="volume-section">
          <div class="section-header">
            <h2>Volumen de Entrenamiento</h2>
            <fit-flow-period-filter (periodChange)="onPeriodChange($event)" />
          </div>

          <div class="charts-row">
            <fit-flow-card padding="md" class="chart-card">
              <h3>Volumen por Fecha</h3>
              @if (volumeStats()?.dataPoints?.length) {
                <fit-flow-volume-chart [dataPoints]="volumeStats()!.dataPoints" />
              } @else {
                <div class="empty-chart">
                  <lucide-icon name="bar-chart-3" [size]="48"></lucide-icon>
                  <p>Sin datos para el período seleccionado</p>
                </div>
              }
            </fit-flow-card>

            <fit-flow-card padding="md" class="chart-card">
              <h3>Distribución por Grupo Muscular</h3>
              @if (volumeStats()?.byMuscleGroup?.length) {
                <fit-flow-muscle-group-chart [data]="volumeStats()!.byMuscleGroup" />
              } @else {
                <div class="empty-chart">
                  <lucide-icon name="pie-chart" [size]="48"></lucide-icon>
                  <p>Sin datos para el período seleccionado</p>
                </div>
              }
            </fit-flow-card>
          </div>
        </section>

        <section class="exercise-section">
          <div class="section-header">
            <h2>Progreso por Ejercicio</h2>
          </div>

          <fit-flow-card padding="md">
            <div class="exercise-controls">
              <fit-flow-exercise-selector
                [exercises]="exercises()"
                (exerciseChange)="onExerciseChange($event)"
              />
            </div>

            @if (selectedExerciseId()) {
              @if (exerciseLoading()) {
                <div class="chart-loading">
                  <fit-flow-loading-spinner size="md" />
                </div>
              } @else if (exerciseProgress()?.dataPoints?.length) {
                <fit-flow-exercise-progress-chart
                  [dataPoints]="exerciseProgress()!.dataPoints"
                  [exerciseName]="exerciseProgress()!.exerciseName"
                />
                @if (exerciseProgress()?.summary) {
                  <div class="exercise-summary">
                    <div class="summary-item">
                      <span class="label">Peso inicial</span>
                      <span class="value">{{ exerciseProgress()!.summary.startWeight ?? '-' }} kg</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Peso actual</span>
                      <span class="value">{{ exerciseProgress()!.summary.currentWeight ?? '-' }} kg</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Cambio</span>
                      <span
                        class="value"
                        [class.positive]="(exerciseProgress()!.summary.weightChange || 0) > 0"
                        [class.negative]="(exerciseProgress()!.summary.weightChange || 0) < 0"
                      >
                        {{ formatWeightChange(exerciseProgress()!.summary.weightChange) }}
                      </span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Entrenamientos</span>
                      <span class="value">{{ exerciseProgress()!.summary.totalWorkouts }}</span>
                    </div>
                  </div>
                }
              } @else {
                <div class="empty-chart">
                  <lucide-icon name="line-chart" [size]="48"></lucide-icon>
                  <p>Sin datos para este ejercicio en el período seleccionado</p>
                </div>
              }
            } @else {
              <div class="empty-chart">
                <lucide-icon name="mouse-pointer-click" [size]="48"></lucide-icon>
                <p>Selecciona un ejercicio para ver tu progreso</p>
              </div>
            }
          </fit-flow-card>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .progress-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
      }

      .page-header {
        margin-bottom: 32px;
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
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }

      .subtitle {
        margin: 8px 0 0;
        color: #64748b;
        font-size: 15px;
      }

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
      }

      h3 {
        margin: 0 0 16px;
        font-size: 15px;
        font-weight: 600;
        color: #374151;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 64px 0;
      }

      .monthly-section {
        margin-bottom: 32px;

        h2 {
          margin-bottom: 16px;
        }
      }

      .volume-section {
        margin-bottom: 32px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }

      .charts-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 16px;
      }

      .chart-card {
        min-height: 380px;
      }

      .exercise-section {
        margin-bottom: 32px;
      }

      .exercise-controls {
        max-width: 300px;
        margin-bottom: 24px;
      }

      .chart-loading {
        display: flex;
        justify-content: center;
        padding: 48px 0;
      }

      .empty-chart {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        color: #9ca3af;
        text-align: center;

        p {
          margin: 12px 0 0;
          font-size: 14px;
        }
      }

      .exercise-summary {
        display: flex;
        justify-content: space-around;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        margin-top: 16px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .label {
          font-size: 12px;
          color: #64748b;
        }

        .value {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;

          &.positive {
            color: #10b981;
          }

          &.negative {
            color: #ef4444;
          }
        }
      }

      @media (max-width: 768px) {
        .charts-row {
          grid-template-columns: 1fr;
        }

        .exercise-summary {
          flex-wrap: wrap;
          gap: 16px;
        }

        .summary-item {
          flex: 1 1 40%;
        }
      }
    `,
  ],
})
export class MyProgressComponent implements OnInit {
  private readonly statsService = inject(StatsService);
  private readonly exercisesService = inject(ExercisesService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly exerciseLoading = signal(false);

  readonly monthlyComparison = signal<MonthlyComparison | null>(null);
  readonly volumeStats = signal<VolumeStats | null>(null);
  readonly exerciseProgress = signal<ExerciseProgress | null>(null);
  readonly exercises = signal<Exercise[]>([]);

  readonly selectedExerciseId = signal<string>('');
  readonly currentQuery = signal<StatsQuery>({});

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      monthly: this.statsService.getMyMonthlyComparison(),
      volume: this.statsService.getMyVolumeStats(),
      exercises: this.exercisesService.getAll({ limit: 100 }),
    }).subscribe({
      next: (result) => {
        this.monthlyComparison.set(result.monthly);
        this.volumeStats.set(result.volume);
        this.exercises.set(result.exercises.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.friendlyMessage || 'Error al cargar los datos de progreso');
        this.loading.set(false);
      },
    });
  }

  onPeriodChange(range: PeriodRange): void {
    const query: StatsQuery = {};
    if (range.startDate) query.startDate = range.startDate;
    if (range.endDate) query.endDate = range.endDate;

    this.currentQuery.set(query);
    this.loadVolumeStats(query);

    if (this.selectedExerciseId()) {
      this.loadExerciseProgress(this.selectedExerciseId(), query);
    }
  }

  onExerciseChange(exerciseId: string): void {
    this.selectedExerciseId.set(exerciseId);
    if (exerciseId) {
      this.loadExerciseProgress(exerciseId, this.currentQuery());
    }
  }

  private loadVolumeStats(query: StatsQuery): void {
    this.statsService.getMyVolumeStats(query).subscribe({
      next: (stats) => this.volumeStats.set(stats),
      error: () => {},
    });
  }

  private loadExerciseProgress(exerciseId: string, query: StatsQuery): void {
    this.exerciseLoading.set(true);
    this.statsService.getMyExerciseProgress(exerciseId, query).subscribe({
      next: (progress) => {
        this.exerciseProgress.set(progress);
        this.exerciseLoading.set(false);
      },
      error: () => {
        this.exerciseProgress.set(null);
        this.exerciseLoading.set(false);
      },
    });
  }

  formatWeightChange(change: number): string {
    if (!change) return '0 kg';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} kg`;
  }
}
