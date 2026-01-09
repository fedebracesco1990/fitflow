import { Component, EventEmitter, Input, Output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MuscleGroupsService } from '../../../../core/services';
import {
  MuscleGroup,
  Difficulty,
  DifficultyLabels,
  Equipment,
  EquipmentLabels,
} from '../../../../core/models';
import { CardComponent, ButtonComponent } from '../../../../shared';

export interface ExerciseFilters {
  search: string;
  muscleGroupId: string;
  difficulty: string;
  equipment: string;
}

@Component({
  selector: 'fit-flow-exercise-filters',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <fit-flow-card class="filters-card">
      <div class="filters">
        <div class="search-box">
          <input
            type="search"
            placeholder="Buscar por nombre..."
            (input)="onSearchInput($event)"
            class="search-input"
          />
        </div>

        <div class="filter-group">
          <select
            (change)="onMuscleGroupChange($event)"
            class="filter-select"
            [value]="filters.muscleGroupId"
          >
            <option value="">Todos los grupos</option>
            @for (group of muscleGroups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>

          <select
            (change)="onDifficultyChange($event)"
            class="filter-select"
            [value]="filters.difficulty"
          >
            <option value="">Todas las dificultades</option>
            @for (diff of difficulties; track diff) {
              <option [value]="diff">{{ difficultyLabels[diff] }}</option>
            }
          </select>

          <select
            (change)="onEquipmentChange($event)"
            class="filter-select"
            [value]="filters.equipment"
          >
            <option value="">Todo el equipamiento</option>
            @for (equip of equipments; track equip) {
              <option [value]="equip">{{ equipmentLabels[equip] }}</option>
            }
          </select>

          <fit-flow-button variant="outline" size="sm" (click)="clearFilters()">
            Limpiar
          </fit-flow-button>
        </div>
      </div>
    </fit-flow-card>
  `,
  styles: [
    `
      .filters-card {
        margin-bottom: 1.5rem;
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
      }

      .search-box {
        flex: 1;
        min-width: 200px;
      }

      .search-input {
        width: 100%;
        padding: 0.625rem 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        background: #ffffff;
        color: #1f2937;
      }

      .search-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      }

      .filter-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .filter-select {
        padding: 0.625rem 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        background: #ffffff;
        color: #1f2937;
        min-width: 150px;
      }

      .filter-select:focus {
        outline: none;
        border-color: #667eea;
      }

      @media (max-width: 768px) {
        .filters {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-group {
          flex-wrap: wrap;
        }

        .filter-select {
          flex: 1;
          min-width: 120px;
        }
      }
    `,
  ],
})
export class ExerciseFiltersComponent implements OnInit {
  private readonly muscleGroupsService = inject(MuscleGroupsService);
  private readonly searchSubject = new Subject<string>();

  @Input() filters: ExerciseFilters = {
    search: '',
    muscleGroupId: '',
    difficulty: '',
    equipment: '',
  };

  @Output() filtersChange = new EventEmitter<ExerciseFilters>();

  muscleGroups = signal<MuscleGroup[]>([]);
  difficulties = Object.values(Difficulty);
  equipments = Object.values(Equipment);
  difficultyLabels = DifficultyLabels;
  equipmentLabels = EquipmentLabels;

  ngOnInit(): void {
    this.loadMuscleGroups();

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((search) => {
      this.emitChange({ search });
    });
  }

  loadMuscleGroups(): void {
    this.muscleGroupsService.getAll().subscribe({
      next: (groups) => this.muscleGroups.set(groups),
      error: (err) => console.error('Error loading muscle groups', err),
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onMuscleGroupChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.emitChange({ muscleGroupId: select.value });
  }

  onDifficultyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.emitChange({ difficulty: select.value });
  }

  onEquipmentChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.emitChange({ equipment: select.value });
  }

  clearFilters(): void {
    const clearedFilters: ExerciseFilters = {
      search: '',
      muscleGroupId: '',
      difficulty: '',
      equipment: '',
    };
    this.filters = clearedFilters;
    this.filtersChange.emit(clearedFilters);

    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
  }

  private emitChange(partial: Partial<ExerciseFilters>): void {
    this.filters = { ...this.filters, ...partial };
    this.filtersChange.emit(this.filters);
  }
}
