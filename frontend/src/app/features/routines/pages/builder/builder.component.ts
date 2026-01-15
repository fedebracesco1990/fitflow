import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { RoutinesService } from '../../../../core/services';
import {
  Routine,
  DayOfWeek,
  DayOfWeekLabels,
  Difficulty,
  DifficultyLabels,
  RoutineExercise,
  TemplateCategory,
  BulkAssignResult,
} from '../../../../core/models';
import { ExercisePanelComponent } from '../../components/exercise-panel/exercise-panel.component';
import { DayColumnComponent, DayExercise } from '../../components/day-column/day-column.component';
import { ButtonComponent, CardComponent } from '../../../../shared';
import { SaveAsTemplateDialogComponent } from '../../components/save-as-template-dialog/save-as-template-dialog.component';
import { AssignRoutineDialogComponent } from '../../components/assign-routine-dialog/assign-routine-dialog.component';

type DayExercisesMap = Record<DayOfWeek, DayExercise[]>;

function createEmptyDayExercisesMap(): DayExercisesMap {
  return {
    [DayOfWeek.MONDAY]: [],
    [DayOfWeek.TUESDAY]: [],
    [DayOfWeek.WEDNESDAY]: [],
    [DayOfWeek.THURSDAY]: [],
    [DayOfWeek.FRIDAY]: [],
    [DayOfWeek.SATURDAY]: [],
    [DayOfWeek.SUNDAY]: [],
  };
}

@Component({
  selector: 'fit-flow-routine-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDropListGroup,
    ExercisePanelComponent,
    DayColumnComponent,
    ButtonComponent,
    CardComponent,
    SaveAsTemplateDialogComponent,
    AssignRoutineDialogComponent,
  ],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
})
export class RoutineBuilderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routinesService = inject(RoutinesService);

  routineId: string | null = null;
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  savingAsTemplate = signal(false);
  error = signal<string | null>(null);

  saveAsTemplateDialogOpen = signal(false);
  assignDialogOpen = signal(false);
  successMessage = signal<string | null>(null);

  routineName = signal('');
  routineDescription = signal('');
  routineDifficulty = signal<Difficulty>(Difficulty.BEGINNER);

  days = Object.values(DayOfWeek);
  dayLabels = DayOfWeekLabels;
  difficulties = Object.values(Difficulty);
  difficultyLabels = DifficultyLabels;

  dayExercises = signal<DayExercisesMap>(createEmptyDayExercisesMap());

  connectedListIds: string[] = [];

  ngOnInit(): void {
    this.connectedListIds = this.days.map((day) => `day-${day}`);

    this.routineId = this.route.snapshot.paramMap.get('id');
    if (this.routineId) {
      this.isEditMode.set(true);
      this.loadRoutine(this.routineId);
    }
  }

  loadRoutine(id: string): void {
    this.loading.set(true);
    this.routinesService.getById(id).subscribe({
      next: (routine) => {
        this.routineName.set(routine.name);
        this.routineDescription.set(routine.description || '');
        this.routineDifficulty.set(routine.difficulty);

        const exercisesByDay = this.groupExercisesByDay(routine.exercises || []);
        this.dayExercises.set(exercisesByDay);

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar rutina');
        this.loading.set(false);
      },
    });
  }

  private groupExercisesByDay(exercises: RoutineExercise[]): DayExercisesMap {
    const result = createEmptyDayExercisesMap();

    exercises.forEach((re) => {
      const day = re.dayOfWeek || DayOfWeek.MONDAY;
      result[day].push({
        id: re.id,
        exercise: re.exercise,
        order: re.order,
        sets: re.sets,
        reps: re.reps,
        restSeconds: re.restSeconds,
        suggestedWeight: re.suggestedWeight,
      });
    });

    Object.values(result).forEach((dayExercises) => {
      dayExercises.sort((a, b) => a.order - b.order);
    });

    return result;
  }

  onDayExercisesChange(day: DayOfWeek, exercises: DayExercise[]): void {
    this.dayExercises.update((current) => ({
      ...current,
      [day]: exercises,
    }));
  }

  getTotalExercises(): number {
    return Object.values(this.dayExercises()).reduce((total, dayExs) => total + dayExs.length, 0);
  }

  async onSave(): Promise<void> {
    if (!this.routineName()) {
      this.error.set('El nombre de la rutina es requerido');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      let routine: Routine;

      if (this.isEditMode() && this.routineId) {
        routine = (await this.routinesService
          .update(this.routineId, {
            name: this.routineName(),
            description: this.routineDescription() || undefined,
            difficulty: this.routineDifficulty(),
          })
          .toPromise()) as Routine;
      } else {
        routine = (await this.routinesService
          .create({
            name: this.routineName(),
            description: this.routineDescription() || undefined,
            difficulty: this.routineDifficulty(),
          })
          .toPromise()) as Routine;
        this.routineId = routine.id;
        this.isEditMode.set(true);
      }

      await this.syncExercises(routine.id);

      this.router.navigate(['/routines']);
    } catch (err: unknown) {
      const error = err as { error?: { message?: string } };
      this.error.set(error.error?.message || 'Error al guardar rutina');
    } finally {
      this.saving.set(false);
    }
  }

  private async syncExercises(routineId: string): Promise<void> {
    const currentRoutine = await this.routinesService.getById(routineId).toPromise();
    const existingExercises = currentRoutine?.exercises || [];

    for (const existingEx of existingExercises) {
      await this.routinesService.removeExercise(routineId, existingEx.id).toPromise();
    }

    for (const day of this.days) {
      const exercises = this.dayExercises()[day];
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        const weight = ex.suggestedWeight != null ? Number(ex.suggestedWeight) : undefined;
        await this.routinesService
          .addExercise(routineId, {
            exerciseId: ex.exercise.id,
            order: i + 1,
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 12,
            restSeconds: Number(ex.restSeconds) || 60,
            suggestedWeight: weight && !isNaN(weight) ? weight : undefined,
            dayOfWeek: day,
          })
          .toPromise();
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/routines']);
  }

  onOpenSaveAsTemplateDialog(): void {
    if (!this.routineId) {
      this.error.set('Primero guarda la rutina antes de convertirla en plantilla');
      return;
    }
    this.saveAsTemplateDialogOpen.set(true);
  }

  async onSaveAsTemplateConfirmed(data: {
    category: TemplateCategory;
    name?: string;
  }): Promise<void> {
    if (!this.routineId) return;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.routineId)) {
      this.error.set(`ID de rutina inválido: "${this.routineId}". Guarda la rutina primero.`);
      this.saveAsTemplateDialogOpen.set(false);
      return;
    }

    this.savingAsTemplate.set(true);
    this.error.set(null);

    try {
      await this.routinesService
        .update(this.routineId, {
          name: this.routineName(),
          description: this.routineDescription() || undefined,
          difficulty: this.routineDifficulty(),
        })
        .toPromise();

      await this.syncExercises(this.routineId);

      this.routinesService
        .saveAsTemplate(this.routineId, { category: data.category, name: data.name })
        .subscribe({
          next: () => {
            this.savingAsTemplate.set(false);
            this.saveAsTemplateDialogOpen.set(false);
            this.router.navigate(['/routines/templates']);
          },
          error: (err) => {
            this.savingAsTemplate.set(false);
            this.error.set(err.error?.message || 'Error al guardar como plantilla');
          },
        });
    } catch (err: unknown) {
      const error = err as { error?: { message?: string } };
      this.savingAsTemplate.set(false);
      this.error.set(error.error?.message || 'Error al guardar cambios antes de crear plantilla');
    }
  }

  onSaveAsTemplateCancelled(): void {
    this.saveAsTemplateDialogOpen.set(false);
  }

  onOpenAssignDialog(): void {
    if (!this.routineId) {
      this.error.set('Primero guarda la rutina antes de asignarla');
      return;
    }
    this.assignDialogOpen.set(true);
  }

  onAssignConfirmed(result: BulkAssignResult): void {
    this.assignDialogOpen.set(false);

    if (result.success) {
      this.successMessage.set(
        `Rutina asignada a ${result.totalAssigned} usuario(s). ${result.totalNotifications} notificación(es) enviada(s).`
      );
      setTimeout(() => this.successMessage.set(null), 5000);
    }

    if (result.errors.length > 0) {
      this.error.set(result.errors.join(', '));
      setTimeout(() => this.error.set(null), 5000);
    }
  }

  onAssignCancelled(): void {
    this.assignDialogOpen.set(false);
  }
}
