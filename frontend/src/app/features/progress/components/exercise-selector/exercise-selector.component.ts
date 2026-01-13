import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Exercise } from '../../../../core/models';

@Component({
  selector: 'fit-flow-exercise-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="exercise-selector">
      <label class="selector-label">Ejercicio</label>
      <div class="select-wrapper">
        <select
          class="exercise-select"
          [ngModel]="selectedExerciseId()"
          (ngModelChange)="onExerciseChange($event)"
        >
          <option value="" disabled>Seleccionar ejercicio</option>
          @for (exercise of filteredExercises(); track exercise.id) {
            <option [value]="exercise.id">{{ exercise.name }}</option>
          }
        </select>
      </div>
      @if (exercises.length > 5) {
        <input
          type="text"
          class="search-input"
          placeholder="Buscar ejercicio..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
        />
      }
    </div>
  `,
  styles: [
    `
      .exercise-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .selector-label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .select-wrapper {
        position: relative;
      }

      .exercise-select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        color: #1f2937;
        background: white;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        padding-right: 36px;

        &:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      }

      .search-input {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 13px;

        &:focus {
          outline: none;
          border-color: #6366f1;
        }
      }
    `,
  ],
})
export class ExerciseSelectorComponent {
  @Input() exercises: Exercise[] = [];
  @Output() exerciseChange = new EventEmitter<string>();

  readonly selectedExerciseId = signal<string>('');
  readonly searchTerm = signal<string>('');

  readonly filteredExercises = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.exercises;
    return this.exercises.filter((e) => e.name.toLowerCase().includes(term));
  });

  onExerciseChange(exerciseId: string): void {
    this.selectedExerciseId.set(exerciseId);
    this.exerciseChange.emit(exerciseId);
  }
}
