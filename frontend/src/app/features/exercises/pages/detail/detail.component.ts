import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExercisesService } from '../../../../core/services';
import { Exercise, Difficulty, DifficultyLabels, EquipmentLabels } from '../../../../core/models';
import { BadgeComponent, ButtonComponent, CardComponent } from '../../../../shared';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-exercise-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="exercise-detail">
      @if (loading()) {
        <div class="loading">Cargando ejercicio...</div>
      } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
          <a routerLink="/exercises">
            <fit-flow-button variant="outline">Volver a ejercicios</fit-flow-button>
          </a>
        </div>
      } @else if (exercise()) {
        <header class="detail-header">
          <a routerLink="/exercises" class="back-link">
            <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
            Volver
          </a>
          <div class="header-actions">
            <a [routerLink]="['/exercises', exercise()!.id, 'edit']">
              <fit-flow-button variant="outline" size="md">
                <lucide-icon name="pencil" [size]="16"></lucide-icon>
                Editar
              </fit-flow-button>
            </a>
          </div>
        </header>

        <div class="detail-content">
          <div class="detail-media">
            @if (exercise()!.imageUrl) {
              <img
                [src]="exercise()!.imageUrl"
                [alt]="exercise()!.name"
                class="exercise-image"
                loading="lazy"
              />
            } @else {
              <div class="placeholder-image">
                <lucide-icon name="dumbbell" [size]="64"></lucide-icon>
              </div>
            }

            @if (exercise()!.videoUrl) {
              <a [href]="exercise()!.videoUrl" target="_blank" class="video-link">
                <fit-flow-button variant="outline" size="md">
                  <lucide-icon name="play-circle" [size]="18"></lucide-icon>
                  Ver Video
                </fit-flow-button>
              </a>
            }
          </div>

          <div class="detail-info">
            <h1>{{ exercise()!.name }}</h1>

            <div class="badges">
              <fit-flow-badge [variant]="getDifficultyVariant(exercise()!.difficulty)">
                {{ difficultyLabels[exercise()!.difficulty] }}
              </fit-flow-badge>
              <fit-flow-badge variant="neutral">
                {{ equipmentLabels[exercise()!.equipment] }}
              </fit-flow-badge>
              @if (exercise()!.muscleGroup) {
                <fit-flow-badge variant="primary">
                  {{ exercise()!.muscleGroup!.name }}
                </fit-flow-badge>
              }
            </div>

            @if (exercise()!.description) {
              <fit-flow-card class="description-card">
                <h3>Descripción</h3>
                <p>{{ exercise()!.description }}</p>
              </fit-flow-card>
            }

            <div class="meta-info">
              <div class="meta-item">
                <span class="meta-label">Grupo Muscular</span>
                <span class="meta-value">{{
                  exercise()!.muscleGroup?.name || 'No especificado'
                }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Equipamiento</span>
                <span class="meta-value">{{ equipmentLabels[exercise()!.equipment] }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Dificultad</span>
                <span class="meta-value">{{ difficultyLabels[exercise()!.difficulty] }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .exercise-detail {
        padding: 1.5rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .loading,
      .error-state {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
      }

      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .back-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6b7280;
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s;
      }

      .back-link:hover {
        color: #667eea;
      }

      .header-actions a {
        text-decoration: none;
      }

      .detail-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }

      @media (max-width: 768px) {
        .detail-content {
          grid-template-columns: 1fr;
        }
      }

      .detail-media {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .exercise-image {
        width: 100%;
        aspect-ratio: 16/10;
        object-fit: cover;
        border-radius: 0.75rem;
        background: #f3f4f6;
      }

      .placeholder-image {
        width: 100%;
        aspect-ratio: 16/10;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f3f4f6;
        border-radius: 0.75rem;
        color: #9ca3af;
      }

      .video-link {
        text-decoration: none;
      }

      .detail-info {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .detail-info h1 {
        margin: 0;
        font-size: 2rem;
        color: #1f2937;
      }

      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .description-card {
        h3 {
          margin: 0 0 0.75rem;
          font-size: 1rem;
          color: #1f2937;
        }

        p {
          margin: 0;
          color: #6b7280;
          line-height: 1.6;
        }
      }

      .meta-info {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        background: #f3f4f6;
        border-radius: 0.75rem;
      }

      .meta-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .meta-label {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .meta-value {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
      }
    `,
  ],
})
export class ExerciseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly exercisesService = inject(ExercisesService);

  exercise = signal<Exercise | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly difficultyLabels = DifficultyLabels;
  readonly equipmentLabels = EquipmentLabels;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExercise(id);
    } else {
      this.error.set('ID de ejercicio no válido');
      this.loading.set(false);
    }
  }

  loadExercise(id: string): void {
    this.loading.set(true);
    this.exercisesService.getById(id).subscribe({
      next: (exercise) => {
        this.exercise.set(exercise);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar ejercicio');
        this.loading.set(false);
      },
    });
  }

  getDifficultyVariant(difficulty: Difficulty): 'success' | 'warning' | 'error' {
    const variantMap = {
      [Difficulty.BEGINNER]: 'success' as const,
      [Difficulty.INTERMEDIATE]: 'warning' as const,
      [Difficulty.ADVANCED]: 'error' as const,
    };
    return variantMap[difficulty];
  }
}
