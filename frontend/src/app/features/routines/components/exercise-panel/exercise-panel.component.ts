import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ExercisesService, MuscleGroupsService } from '../../../../core/services';
import { Exercise, MuscleGroup } from '../../../../core/models';

@Component({
  selector: 'fit-flow-exercise-panel',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDragPlaceholder, CdkDropList],
  template: `
    <div class="exercise-panel">
      <div class="panel-header">
        <h3>Biblioteca de Ejercicios</h3>
      </div>

      <div class="panel-filters">
        <input
          type="search"
          placeholder="Buscar ejercicio..."
          class="search-input"
          (input)="onSearchInput($event)"
        />

        <select class="filter-select" (change)="onMuscleGroupChange($event)">
          <option value="">Todos los grupos</option>
          @for (group of muscleGroups(); track group.id) {
            <option [value]="group.id">{{ group.name }}</option>
          }
        </select>
      </div>

      <div
        class="exercise-list"
        cdkDropList
        id="exercise-panel"
        [cdkDropListData]="exercises()"
        [cdkDropListConnectedTo]="connectedLists"
        [cdkDropListSortingDisabled]="true"
      >
        @if (loading()) {
          <div class="loading">Cargando ejercicios...</div>
        } @else if (exercises().length === 0) {
          <div class="empty">No se encontraron ejercicios</div>
        } @else {
          @for (exercise of exercises(); track exercise.id) {
            <div class="exercise-item" cdkDrag [cdkDragData]="exercise">
              <div class="drag-placeholder" *cdkDragPlaceholder></div>
              <div class="exercise-content">
                @if (exercise.imageUrl) {
                  <img [src]="exercise.imageUrl" [alt]="exercise.name" class="exercise-thumb" />
                } @else {
                  <div class="exercise-thumb placeholder">
                    {{ exercise.name.charAt(0).toUpperCase() }}
                  </div>
                }
                <div class="exercise-info">
                  <span class="exercise-name">{{ exercise.name }}</span>
                  @if (exercise.muscleGroup) {
                    <span class="exercise-muscle">{{ exercise.muscleGroup.name }}</span>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .exercise-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #ffffff;
        border-radius: 0.75rem;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }

      .panel-header {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .panel-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
      }

      .panel-filters {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .search-input,
      .filter-select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        background: #ffffff;
      }

      .search-input:focus,
      .filter-select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
      }

      .exercise-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
      }

      .exercise-item {
        padding: 0.625rem;
        margin-bottom: 0.5rem;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        cursor: grab;
        transition: all 0.2s ease;
      }

      .exercise-item:hover {
        background: #f3f4f6;
        border-color: #667eea;
      }

      .exercise-item:active {
        cursor: grabbing;
      }

      .exercise-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .exercise-thumb {
        width: 40px;
        height: 40px;
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
        font-size: 1rem;
      }

      .exercise-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        min-width: 0;
      }

      .exercise-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .exercise-muscle {
        font-size: 0.75rem;
        color: #6b7280;
      }

      .drag-placeholder {
        background: #e5e7eb;
        border: 2px dashed #9ca3af;
        border-radius: 0.5rem;
        height: 56px;
      }

      .loading,
      .empty {
        padding: 2rem;
        text-align: center;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .cdk-drag-preview {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 0.5rem;
        background: #ffffff;
      }

      .cdk-drag-animating {
        transition: transform 200ms ease;
      }
    `,
  ],
})
export class ExercisePanelComponent implements OnInit {
  private readonly exercisesService = inject(ExercisesService);
  private readonly muscleGroupsService = inject(MuscleGroupsService);
  private readonly searchSubject = new Subject<string>();

  @Input() connectedLists: string[] = [];

  exercises = signal<Exercise[]>([]);
  muscleGroups = signal<MuscleGroup[]>([]);
  loading = signal(true);

  private filters = {
    search: '',
    muscleGroupId: '',
  };

  ngOnInit(): void {
    this.loadMuscleGroups();
    this.loadExercises();

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((search) => {
      this.filters.search = search;
      this.loadExercises();
    });
  }

  loadMuscleGroups(): void {
    this.muscleGroupsService.getAll().subscribe({
      next: (groups) => this.muscleGroups.set(groups),
      error: (err) => console.error('Error loading muscle groups', err),
    });
  }

  loadExercises(): void {
    this.loading.set(true);
    this.exercisesService
      .getAll({
        limit: 100,
        muscleGroupId: this.filters.muscleGroupId || undefined,
        search: this.filters.search || undefined,
      })
      .subscribe({
        next: (response) => {
          this.exercises.set(response.data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading exercises', err);
          this.loading.set(false);
        },
      });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onMuscleGroupChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filters.muscleGroupId = select.value;
    this.loadExercises();
  }
}
