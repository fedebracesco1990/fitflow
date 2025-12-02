import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExercisesService, MuscleGroupsService } from '../../../../core/services';
import { MuscleGroup, Difficulty, DifficultyLabels } from '../../../../core/models';

@Component({
  selector: 'fit-flow-exercise-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class ExerciseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly exercisesService = inject(ExercisesService);
  private readonly muscleGroupsService = inject(MuscleGroupsService);

  form: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  exerciseId: string | null = null;

  muscleGroups = signal<MuscleGroup[]>([]);
  difficulties = Object.values(Difficulty);
  difficultyLabels = DifficultyLabels;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      muscleGroupId: ['', Validators.required],
      difficulty: [Difficulty.BEGINNER],
      videoUrl: [''],
      imageUrl: [''],
    });
  }

  ngOnInit(): void {
    this.loadMuscleGroups();
    this.exerciseId = this.route.snapshot.paramMap.get('id');
    if (this.exerciseId) {
      this.isEditMode.set(true);
      this.loadExercise(this.exerciseId);
    }
  }

  loadMuscleGroups(): void {
    this.muscleGroupsService.getAll().subscribe({
      next: (groups) => this.muscleGroups.set(groups),
      error: (err) => console.error('Error loading muscle groups', err),
    });
  }

  loadExercise(id: string): void {
    this.loading.set(true);
    this.exercisesService.getById(id).subscribe({
      next: (exercise) => {
        this.form.patchValue({
          name: exercise.name,
          description: exercise.description || '',
          muscleGroupId: exercise.muscleGroupId || '',
          difficulty: exercise.difficulty,
          videoUrl: exercise.videoUrl || '',
          imageUrl: exercise.imageUrl || '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar ejercicio');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const data = this.form.value;

    const request = this.isEditMode()
      ? this.exercisesService.update(this.exerciseId!, data)
      : this.exercisesService.create(data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/exercises']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al guardar ejercicio');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/exercises']);
  }
}
