import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routine, DifficultyLabels } from '../../../../core/models';

export interface RoutineExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
  suggestedWeight: number | null;
  notes: string | null;
  isNew?: boolean;
  isModified?: boolean;
}

export interface RoutineDetailDialogData {
  programRoutineId: string;
  routine: Routine;
  dayNumber: number;
  exercises: RoutineExerciseItem[];
}

@Component({
  selector: 'fit-flow-routine-detail-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routine-detail-dialog.component.html',
  styleUrl: './routine-detail-dialog.component.scss',
})
export class RoutineDetailDialogComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() data: RoutineDetailDialogData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<RoutineExerciseItem[]>();

  exercises = signal<RoutineExerciseItem[]>([]);
  editingExerciseId = signal<string | null>(null);
  saving = signal(false);

  difficultyLabels = DifficultyLabels;

  hasChanges = computed(() => {
    return this.exercises().some((e) => e.isNew || e.isModified);
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.toggleBodyScroll(this.isOpen);
    }
    if (this.data?.exercises) {
      this.exercises.set([...this.data.exercises]);
    }
  }

  ngOnDestroy(): void {
    this.toggleBodyScroll(false);
  }

  private toggleBodyScroll(disable: boolean): void {
    if (disable) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onClose();
    }
  }

  onClose(): void {
    this.editingExerciseId.set(null);
    this.close.emit();
  }

  startEditing(exerciseId: string): void {
    this.editingExerciseId.set(exerciseId);
  }

  stopEditing(): void {
    this.editingExerciseId.set(null);
  }

  updateExercise(exerciseId: string, field: string, value: number | string): void {
    this.exercises.update((list) =>
      list.map((e) => {
        if (e.id === exerciseId) {
          return { ...e, [field]: value, isModified: true };
        }
        return e;
      })
    );
  }

  removeExercise(exerciseId: string): void {
    this.exercises.update((list) => list.filter((e) => e.id !== exerciseId));
  }

  moveExercise(exerciseId: string, direction: 'up' | 'down'): void {
    this.exercises.update((list) => {
      const index = list.findIndex((e) => e.id === exerciseId);
      if (index === -1) return list;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return list;

      const newList = [...list];
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];

      return newList.map((e, i) => ({ ...e, order: i + 1, isModified: true }));
    });
  }

  onSave(): void {
    this.saving.set(true);
    this.save.emit(this.exercises());
  }

  onSaveComplete(): void {
    this.saving.set(false);
  }
}
