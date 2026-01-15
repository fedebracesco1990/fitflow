import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DayExercise } from '../day-column/day-column.component';

@Component({
  selector: 'fit-flow-routine-exercise-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="exercise-item" [class.is-new]="exercise.isNew">
      <div class="item-header">
        <div class="exercise-info">
          @if (exercise.exercise.imageUrl) {
            <img
              [src]="exercise.exercise.imageUrl"
              [alt]="exercise.exercise.name"
              class="exercise-thumb"
            />
          } @else {
            <div class="exercise-thumb placeholder">
              {{ exercise.exercise.name.charAt(0).toUpperCase() }}
            </div>
          }
          <div class="exercise-details">
            <span class="exercise-name">{{ exercise.exercise.name }}</span>
            @if (exercise.exercise.muscleGroup) {
              <span class="exercise-muscle">{{ exercise.exercise.muscleGroup.name }}</span>
            }
          </div>
        </div>
        <button class="btn-remove" (click)="onRemove()" title="Eliminar">✕</button>
      </div>

      <div class="config-grid">
        <div class="config-item">
          <label>Series</label>
          <input
            type="number"
            [ngModel]="exercise.sets"
            (ngModelChange)="onConfigChange('sets', $event)"
            min="1"
            max="10"
          />
        </div>
        <div class="config-item">
          <label>Reps</label>
          <input
            type="number"
            [ngModel]="exercise.reps"
            (ngModelChange)="onConfigChange('reps', $event)"
            min="1"
            max="100"
          />
        </div>
        <div class="config-item">
          <label>Peso (kg)</label>
          <input
            type="number"
            [ngModel]="exercise.suggestedWeight"
            (ngModelChange)="onConfigChange('suggestedWeight', $event)"
            min="0"
            max="500"
            step="0.5"
            placeholder="-"
          />
        </div>
        <div class="config-item">
          <label>Descanso (s)</label>
          <input
            type="number"
            [ngModel]="exercise.restSeconds"
            (ngModelChange)="onConfigChange('restSeconds', $event)"
            min="0"
            max="300"
            step="15"
          />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .exercise-item {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        transition: all 0.2s ease;
      }

      .exercise-item:hover {
        border-color: #d1d5db;
      }

      .exercise-item.is-new {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.05);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .exercise-info {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        flex: 1;
        min-width: 0;
      }

      .exercise-thumb {
        width: 36px;
        height: 36px;
        border-radius: 0.375rem;
        object-fit: cover;
        flex-shrink: 0;
      }

      .exercise-thumb.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-size: 0.875rem;
      }

      .exercise-details {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        min-width: 0;
      }

      .exercise-name {
        font-size: 0.8125rem;
        font-weight: 500;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .exercise-muscle {
        font-size: 0.6875rem;
        color: #6b7280;
      }

      .btn-remove {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: #9ca3af;
        cursor: pointer;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        flex-shrink: 0;
      }

      .btn-remove:hover {
        background: #fee2e2;
        color: #dc2626;
      }

      .config-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }

      .config-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .config-item label {
        font-size: 0.6875rem;
        color: #6b7280;
        font-weight: 500;
      }

      .config-item input {
        width: 100%;
        padding: 0.375rem 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        font-size: 0.8125rem;
        background: #ffffff;
      }

      .config-item input:focus {
        outline: none;
        border-color: #667eea;
      }

      .config-item input::placeholder {
        color: #d1d5db;
      }
    `,
  ],
})
export class RoutineExerciseItemComponent {
  @Input() exercise!: DayExercise;
  @Input() index!: number;

  @Output() configChange = new EventEmitter<Partial<DayExercise>>();
  @Output() remove = new EventEmitter<void>();

  onConfigChange(field: keyof DayExercise, value: number | null): void {
    this.configChange.emit({ [field]: value });
  }

  onRemove(): void {
    this.remove.emit();
  }
}
