import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise, Difficulty, DifficultyLabels, EquipmentLabels } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-exercise-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="exercise-card"
      tabindex="0"
      role="button"
      (click)="onCardClick()"
      (keydown.enter)="onCardClick()"
    >
      <div class="card-image">
        @if (exercise.imageUrl) {
          <img
            [src]="exercise.imageUrl"
            [alt]="exercise.name"
            loading="lazy"
            (error)="onImageError($event)"
          />
        } @else {
          <div class="placeholder-image">
            <span>{{ exercise.name.charAt(0).toUpperCase() }}</span>
          </div>
        }
      </div>

      <div class="card-content">
        <h3 class="card-title">{{ exercise.name }}</h3>

        <div class="card-meta">
          @if (exercise.muscleGroup) {
            <span class="muscle-group">{{ exercise.muscleGroup.name }}</span>
          }
        </div>

        <div class="card-badges">
          <fit-flow-badge [variant]="getDifficultyVariant(exercise.difficulty)">
            {{ difficultyLabels[exercise.difficulty] }}
          </fit-flow-badge>
          <fit-flow-badge variant="neutral">
            {{ equipmentLabels[exercise.equipment] }}
          </fit-flow-badge>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      .exercise-card {
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow:
          0 1px 3px 0 rgb(0 0 0 / 0.1),
          0 1px 2px -1px rgb(0 0 0 / 0.1);
      }

      .exercise-card:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .card-image {
        aspect-ratio: 16/10;
        background: #f3f4f6;
        overflow: hidden;
      }

      .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .placeholder-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 2rem;
        font-weight: 600;
      }

      .card-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .card-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
        line-height: 1.3;
      }

      .card-meta {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .muscle-group {
        display: inline-block;
      }

      .card-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class ExerciseCardComponent {
  @Input({ required: true }) exercise!: Exercise;
  @Output() cardClick = new EventEmitter<Exercise>();

  readonly difficultyLabels = DifficultyLabels;
  readonly equipmentLabels = EquipmentLabels;

  getDifficultyVariant(difficulty: Difficulty): 'success' | 'warning' | 'error' {
    const variantMap = {
      [Difficulty.BEGINNER]: 'success' as const,
      [Difficulty.INTERMEDIATE]: 'warning' as const,
      [Difficulty.ADVANCED]: 'error' as const,
    };
    return variantMap[difficulty];
  }

  onCardClick(): void {
    this.cardClick.emit(this.exercise);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
