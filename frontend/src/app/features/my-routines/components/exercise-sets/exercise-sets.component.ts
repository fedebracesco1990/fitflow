import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutStateService, OfflineWorkoutsService } from '../../../../core/services';
import { EditSetDialogComponent } from '../edit-set-dialog/edit-set-dialog.component';

interface SetData {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

@Component({
  selector: 'fit-flow-exercise-sets',
  standalone: true,
  imports: [CommonModule, EditSetDialogComponent],
  templateUrl: './exercise-sets.component.html',
  styleUrl: './exercise-sets.component.scss',
})
export class ExerciseSetsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stateService = inject(WorkoutStateService);
  private readonly offlineWorkoutsService = inject(OfflineWorkoutsService);

  exerciseName = signal('');
  sets = signal<SetData[]>([]);

  ngOnInit(): void {
    const exerciseId = this.route.snapshot.paramMap.get('exerciseId');
    if (exerciseId) {
      this.loadExerciseData(exerciseId);
    }
  }

  private loadExerciseData(exerciseId: string): void {
    // Get exercise state for the name
    const exerciseStates = this.stateService.exerciseStates();
    const exerciseState = exerciseStates.find((e) => e.id === exerciseId);
    if (exerciseState) {
      this.exerciseName.set(exerciseState.name);
    }

    // Get real exercise logs from the workout
    const exerciseLogs = this.stateService.getExerciseLogsForExercise(
      exerciseState?.exerciseId || exerciseId
    );

    if (exerciseLogs.length > 0) {
      this.sets.set(
        exerciseLogs.map((log) => ({
          id: log.id,
          setNumber: log.setNumber,
          reps: log.reps,
          weight: log.weight ?? 0,
          completed: log.completed,
        }))
      );
    }
  }

  editDialogOpen = signal(false);
  editingSet = signal<SetData | null>(null);

  get completedSets(): number {
    return this.sets().filter((s) => s.completed).length;
  }

  get totalSets(): number {
    return this.sets().length;
  }

  get progressPercentage(): number {
    if (this.totalSets === 0) return 0;
    return (this.completedSets / this.totalSets) * 100;
  }

  get allSetsCompleted(): boolean {
    return this.totalSets > 0 && this.completedSets === this.totalSets;
  }

  getCurrentSetIndex(): number {
    const idx = this.sets().findIndex((s) => !s.completed);
    return idx >= 0 ? idx : this.sets().length - 1;
  }

  isCurrentSet(set: SetData): boolean {
    return this.sets().findIndex((s) => !s.completed) === this.sets().indexOf(set);
  }

  onEditSet(set: SetData): void {
    this.editingSet.set(set);
    this.editDialogOpen.set(true);
  }

  onCompleteSet(set: SetData): void {
    this.sets.update((sets) => sets.map((s) => (s.id === set.id ? { ...s, completed: true } : s)));

    // Persist the completed set via offline workouts service
    const workoutLogId = this.stateService.workoutLogId();
    if (workoutLogId) {
      this.offlineWorkoutsService
        .updateExerciseLog(workoutLogId, set.id, { completed: true })
        .subscribe();
    }

    if (this.completedSets === this.totalSets) {
      this.stateService.markCurrentCompleted();
      this.stateService.startRest(90);
    }
  }

  onEditSave(data: { reps: number; weight: number }): void {
    const set = this.editingSet();
    if (!set) return;

    // Solo actualizar reps y weight, mantener el estado de completed
    this.sets.update((sets) =>
      sets.map((s) => (s.id === set.id ? { ...s, reps: data.reps, weight: data.weight } : s))
    );

    // Persist the edit via offline workouts service
    const workoutLogId = this.stateService.workoutLogId();
    if (workoutLogId) {
      this.offlineWorkoutsService
        .updateExerciseLog(workoutLogId, set.id, { reps: data.reps, weight: data.weight })
        .subscribe();
    }

    this.editDialogOpen.set(false);
    this.editingSet.set(null);
  }

  onEditCancel(): void {
    this.editDialogOpen.set(false);
    this.editingSet.set(null);
  }

  addSet(): void {
    const newSetNumber = this.sets().length + 1;
    const lastSet = this.sets()[this.sets().length - 1];
    this.sets.update((sets) => [
      ...sets,
      {
        id: `new-${Date.now()}`,
        setNumber: newSetNumber,
        reps: lastSet?.reps || 10,
        weight: lastSet?.weight || 0,
        completed: false,
      },
    ]);
  }

  onCompleteExercise(): void {
    if (!this.allSetsCompleted) return;

    // Marcar ejercicio como completado con los sets finalizados
    const exerciseId = this.route.snapshot.paramMap.get('exerciseId');
    if (exerciseId) {
      this.stateService.updateExerciseStatus(exerciseId, 'completed');
      this.stateService.updateExerciseSets(exerciseId, this.completedSets);
    }

    this.stateService.startRest(90);
    this.goBack();
  }

  goBack(): void {
    // Navegar al workout activo usando el workoutId del stateService
    const workoutId = this.stateService.workoutId();
    if (workoutId) {
      this.router.navigate(['/my-routines', workoutId, 'start']);
    } else {
      this.router.navigate(['/my-routines']);
    }
  }
}
