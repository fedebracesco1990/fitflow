import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { RoutinesService } from '../../../../core/services';
import {
  RoutineType,
  Difficulty,
  DifficultyLabels,
  CreateRoutineDto,
  Routine,
  ProgramRoutine,
} from '../../../../core/models';
import {
  RoutineDetailDialogComponent,
  RoutineDetailDialogData,
  RoutineExerciseItem,
} from '../../components/routine-detail-dialog/routine-detail-dialog.component';

interface PendingDayAssignment {
  routine: Routine;
  dayNumber: number;
}

@Component({
  selector: 'fit-flow-weekly-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CdkDropList,
    CdkDrag,
    RoutineDetailDialogComponent,
  ],
  templateUrl: './weekly-builder.component.html',
  styleUrl: './weekly-builder.component.scss',
})
export class WeeklyProgramBuilderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routinesService = inject(RoutinesService);

  programId = signal<string | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  formData = signal({
    name: '',
    description: '',
    difficulty: Difficulty.BEGINNER,
    estimatedDuration: 60,
    durationWeeks: 4,
  });

  availableRoutines = signal<Routine[]>([]);
  programRoutines = signal<ProgramRoutine[]>([]);
  pendingAssignments = signal<PendingDayAssignment[]>([]);
  routineSearch = signal('');
  selectedFilter = signal('');
  selectedRoutine = signal<Routine | null>(null);

  // Dialog state
  dialogOpen = signal(false);
  dialogData = signal<RoutineDetailDialogData | null>(null);

  allDayAssignments = computed(() => {
    const saved = this.programRoutines().map((pr) => ({
      routine: pr.routine,
      dayNumber: pr.dayNumber,
      isSaved: true,
      routineId: pr.routineId,
    }));
    const pending = this.pendingAssignments().map((pa) => ({
      routine: pa.routine,
      dayNumber: pa.dayNumber,
      isSaved: false,
      routineId: pa.routine.id,
    }));
    return [...saved, ...pending];
  });

  difficultyOptions = Object.values(Difficulty);
  difficultyLabels = DifficultyLabels;
  days = [1, 2, 3, 4, 5, 6, 7];
  dayLabels = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];

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
    this.routinesService.getById(id).subscribe({
      next: (program) => {
        this.formData.set({
          name: program.name,
          description: program.description || '',
          difficulty: program.difficulty,
          estimatedDuration: program.estimatedDuration,
          durationWeeks: 4,
        });
        this.loadProgramRoutines(id);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar programa');
        this.loading.set(false);
      },
    });
  }

  loadProgramRoutines(programId: string): void {
    this.routinesService.getProgramRoutines(programId).subscribe({
      next: (routines) => {
        this.programRoutines.set(routines);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getRoutinesForDay(dayNumber: number): ProgramRoutine[] {
    return this.programRoutines().filter((pr) => pr.dayNumber === dayNumber);
  }

  addRoutineToDay(routineId: string, dayNumber: number): void {
    if (!this.programId()) return;

    this.routinesService
      .addRoutineToProgram(this.programId()!, { routineId, dayNumber })
      .subscribe({
        next: (pr) => this.programRoutines.update((list) => [...list, pr]),
        error: (err) => this.error.set(err.error?.message || 'Error al agregar rutina'),
      });
  }

  removeRoutineFromDay(routineId: string, dayNumber: number): void {
    if (!this.programId()) return;

    this.routinesService
      .removeRoutineFromProgram(this.programId()!, routineId, dayNumber)
      .subscribe({
        next: () =>
          this.programRoutines.update((list) =>
            list.filter((pr) => !(pr.routineId === routineId && pr.dayNumber === dayNumber))
          ),
        error: (err) => this.error.set(err.error?.message || 'Error al quitar rutina'),
      });
  }

  updateFormField(field: string, value: string | number): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
  }

  save(): void {
    const form = this.formData();
    if (!form.name.trim()) {
      this.error.set('El nombre es requerido');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const dto: CreateRoutineDto = {
      name: form.name,
      description: form.description || undefined,
      difficulty: form.difficulty,
      estimatedDuration: form.estimatedDuration,
      type: RoutineType.WEEKLY,
    };

    if (this.isEditMode() && this.programId()) {
      this.routinesService.update(this.programId()!, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/training']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar');
          this.saving.set(false);
        },
      });
    } else {
      this.routinesService.create(dto).subscribe({
        next: (program) => {
          this.programId.set(program.id);
          this.savePendingAssignments(program.id);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear');
          this.saving.set(false);
        },
      });
    }
  }

  private savePendingAssignments(programId: string): void {
    const pending = this.pendingAssignments();

    if (pending.length === 0) {
      this.saving.set(false);
      this.router.navigate(['/training']);
      return;
    }

    let completed = 0;
    pending.forEach((assignment) => {
      this.routinesService
        .addRoutineToProgram(programId, {
          routineId: assignment.routine.id,
          dayNumber: assignment.dayNumber,
        })
        .subscribe({
          next: () => {
            completed++;
            if (completed === pending.length) {
              this.saving.set(false);
              this.router.navigate(['/training']);
            }
          },
          error: () => {
            completed++;
            if (completed === pending.length) {
              this.saving.set(false);
              this.router.navigate(['/training']);
            }
          },
        });
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
  }

  openDaySelector(): void {
    // TODO: Open modal to select day for adding routine
    console.log('Open day selector');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRoutineDropped(event: CdkDragDrop<any>): void {
    if (event.previousContainer !== event.container) {
      const routine = event.previousContainer.data[event.previousIndex] as Routine;
      if (routine) {
        // Find next available day
        const usedDays = new Set(this.allDayAssignments().map((a) => a.dayNumber));
        let nextDay = 1;
        while (usedDays.has(nextDay) && nextDay <= 7) {
          nextDay++;
        }
        if (nextDay <= 7) {
          if (this.programId()) {
            // Si ya existe el programa, guardar directamente
            this.addRoutineToDay(routine.id, nextDay);
          } else {
            // Si es nuevo, agregar a pendientes
            this.pendingAssignments.update((list) => [...list, { routine, dayNumber: nextDay }]);
          }
        }
      }
    }
  }

  removePendingAssignment(routineId: string, dayNumber: number): void {
    this.pendingAssignments.update((list) =>
      list.filter((a) => !(a.routine.id === routineId && a.dayNumber === dayNumber))
    );
  }

  saveDraft(): void {
    // TODO: Implement draft saving
    console.log('Saving draft...');
  }

  // Dialog methods
  openRoutineDetail(assignment: {
    routine: Routine;
    dayNumber: number;
    isSaved: boolean;
    routineId: string;
  }): void {
    const programRoutine = this.programRoutines().find(
      (pr) => pr.routineId === assignment.routineId && pr.dayNumber === assignment.dayNumber
    );

    const exercises: RoutineExerciseItem[] = (assignment.routine.exercises || []).map(
      (re, index) => ({
        id: re.id,
        exerciseId: re.exerciseId,
        exerciseName: re.exercise?.name || 'Ejercicio',
        order: re.order || index + 1,
        sets: re.sets,
        reps: re.reps,
        restSeconds: re.restSeconds,
        suggestedWeight: re.suggestedWeight,
        notes: re.notes,
      })
    );

    this.dialogData.set({
      programRoutineId: programRoutine?.id || '',
      routine: assignment.routine,
      dayNumber: assignment.dayNumber,
      exercises,
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.dialogData.set(null);
  }

  onDialogSave(exercises: RoutineExerciseItem[]): void {
    const data = this.dialogData();
    if (!data?.programRoutineId) {
      this.closeDialog();
      return;
    }

    // TODO: Call API to save custom exercises
    console.log('Saving exercises for programRoutineId:', data.programRoutineId, exercises);
    this.closeDialog();
  }
}
