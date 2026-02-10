import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { RoutinesService, UserProgramsService } from '../../../../core/services';
import { ButtonComponent } from '../../../../shared';
import { RoutineType, Difficulty, DifficultyLabels, Routine } from '../../../../core/models';
import { Program, CreateProgramDto } from '../../../../core/services/user-programs.service';

interface PendingRoutineAssignment {
  routine: Routine;
  order: number;
}

@Component({
  selector: 'fit-flow-weekly-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CdkDropList, CdkDrag, ButtonComponent],
  templateUrl: './weekly-builder.component.html',
  styleUrl: './weekly-builder.component.scss',
})
export class WeeklyProgramBuilderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routinesService = inject(RoutinesService);
  private readonly programsService = inject(UserProgramsService);

  programId = signal<string | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  formData = signal({
    name: '',
    description: '',
    difficulty: Difficulty.BEGINNER,
  });

  availableRoutines = signal<Routine[]>([]);
  pendingAssignments = signal<PendingRoutineAssignment[]>([]);
  routineSearch = signal('');
  selectedFilter = signal('');
  selectedRoutine = signal<Routine | null>(null);
  currentProgram = signal<Program | null>(null);

  addedRoutineIds = computed(() => this.pendingAssignments().map((pa) => pa.routine.id));

  allAssignments = computed(() => {
    return this.pendingAssignments().map((pa) => ({
      routine: pa.routine,
      order: pa.order,
      routineId: pa.routine.id,
    }));
  });

  difficultyOptions = Object.values(Difficulty);
  difficultyLabels = DifficultyLabels;

  routineFilters = [
    { value: '', label: 'Todo' },
    { value: 'empujar', label: 'Empujar' },
    { value: 'tirar', label: 'Tirar' },
    { value: 'hombros', label: 'Hombros' },
    { value: 'hiit', label: 'HIIT' },
  ];

  filteredRoutines = computed(() => {
    let result = this.availableRoutines();
    const search = this.routineSearch().toLowerCase().trim();
    const filter = this.selectedFilter();

    if (search) {
      result = result.filter((r) => r.name.toLowerCase().includes(search));
    }
    if (filter) {
      result = result.filter((r) => r.name.toLowerCase().includes(filter));
    }
    return result;
  });

  ngOnInit(): void {
    this.loadAvailableRoutines();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.programId.set(id);
      this.isEditMode.set(true);
      this.loadProgram(id);
    }
  }

  loadAvailableRoutines(): void {
    this.routinesService.getAll({ type: RoutineType.DAILY, limit: 100 }).subscribe({
      next: (response) => this.availableRoutines.set(response.data),
      error: (err) => console.error('Error loading routines', err),
    });
  }

  loadProgram(id: string): void {
    this.loading.set(true);
    this.programsService.getById(id).subscribe({
      next: (program) => {
        this.currentProgram.set(program);
        this.formData.set({
          name: program.name,
          description: program.description || '',
          difficulty: program.difficulty,
        });

        // Cargar las rutinas del programa en pendingAssignments
        if (program.routines && program.routines.length > 0) {
          const assignments: PendingRoutineAssignment[] = program.routines
            .sort((a, b) => a.order - b.order)
            .map((pr) => ({
              routine: {
                id: pr.routine.id,
                name: pr.routine.name,
                description: pr.routine.description,
                difficulty: pr.routine.difficulty,
                estimatedDuration: pr.routine.estimatedDuration,
                exercises: pr.routine.exercises || pr.exercises || [],
              } as Routine,
              order: pr.order,
            }));
          this.pendingAssignments.set(assignments);
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar programa');
        this.loading.set(false);
      },
    });
  }

  updateFormField(field: string, value: string | number): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
  }

  addRoutine(routine: Routine): void {
    const currentAssignments = this.pendingAssignments();
    const alreadyAdded = currentAssignments.some((a) => a.routine.id === routine.id);
    if (alreadyAdded) {
      this.error.set('Esta rutina ya está agregada');
      return;
    }

    const nextOrder = currentAssignments.length + 1;
    this.pendingAssignments.update((list) => [...list, { routine, order: nextOrder }]);
  }

  removeAssignment(routineId: string): void {
    this.pendingAssignments.update((list) => {
      const filtered = list.filter((a) => a.routine.id !== routineId);
      return filtered.map((a, index) => ({ ...a, order: index + 1 }));
    });
  }

  save(): void {
    const form = this.formData();
    if (!form.name.trim()) {
      this.error.set('El nombre es requerido');
      return;
    }

    const pending = this.pendingAssignments();
    if (pending.length === 0) {
      this.error.set('Debe agregar al menos una rutina');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const dto: CreateProgramDto = {
      name: form.name,
      description: form.description || undefined,
      difficulty: form.difficulty,
      routines: pending.map((a) => ({
        routineId: a.routine.id,
        order: a.order,
      })),
    };

    const request$ =
      this.isEditMode() && this.programId()
        ? this.programsService.update(this.programId()!, dto)
        : this.programsService.create(dto);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/training']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar programa');
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/training']);
  }

  goBack(): void {
    this.router.navigate(['/training']);
  }

  onRoutineSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.routineSearch.set(input.value);
  }

  selectFilter(value: string): void {
    this.selectedFilter.set(value);
  }

  selectRoutine(routine: Routine): void {
    this.selectedRoutine.set(routine);
    this.addRoutine(routine);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRoutineDropped(event: CdkDragDrop<any>): void {
    if (event.previousContainer !== event.container) {
      const routine = event.previousContainer.data[event.previousIndex] as Routine;
      if (routine) {
        this.addRoutine(routine);
      }
    }
  }
}
