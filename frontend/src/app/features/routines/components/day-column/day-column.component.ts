import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Exercise, DayOfWeek, DayOfWeekLabels } from '../../../../core/models';
import { RoutineExerciseItemComponent } from '../routine-exercise-item/routine-exercise-item.component';

export interface DayExercise {
  id?: string;
  exercise: Exercise;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
  suggestedWeight: number | null;
  isNew?: boolean;
}

@Component({
  selector: 'fit-flow-day-column',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, RoutineExerciseItemComponent],
  template: `
    <div class="day-column">
      <div class="day-header">
        <span class="day-name">{{ dayLabel }}</span>
        <span class="exercise-count">{{ exercises.length }} ejercicios</span>
      </div>

      <div
        class="day-content"
        cdkDropList
        [id]="'day-' + day"
        [cdkDropListData]="exercises"
        [cdkDropListConnectedTo]="connectedLists"
        (cdkDropListDropped)="onDrop($event)"
      >
        @if (exercises.length === 0) {
          <div class="drop-hint">Arrastra ejercicios aquí</div>
        }
        @for (item of exercises; track item.exercise.id; let i = $index) {
          <div cdkDrag [cdkDragData]="item">
            <fit-flow-routine-exercise-item
              [exercise]="item"
              [index]="i"
              (configChange)="onConfigChange(i, $event)"
              (remove)="onRemove(i)"
            />
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .day-column {
        display: flex;
        flex-direction: column;
        min-width: 200px;
        max-width: 280px;
        flex: 1;
        background: #ffffff;
        border-radius: 0.75rem;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }

      .day-header {
        padding: 0.75rem 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .day-name {
        font-weight: 600;
        font-size: 0.875rem;
      }

      .exercise-count {
        font-size: 0.75rem;
        opacity: 0.9;
      }

      .day-content {
        flex: 1;
        min-height: 300px;
        padding: 0.5rem;
        overflow-y: auto;
      }

      .drop-hint {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 100px;
        border: 2px dashed #e5e7eb;
        border-radius: 0.5rem;
        color: #9ca3af;
        font-size: 0.875rem;
        text-align: center;
        padding: 1rem;
      }

      .cdk-drop-list-dragging .drop-hint {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.05);
      }

      .cdk-drag-placeholder {
        background: #f3f4f6;
        border: 2px dashed #667eea;
        border-radius: 0.5rem;
        min-height: 80px;
      }

      .cdk-drag-preview {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-radius: 0.5rem;
      }
    `,
  ],
})
export class DayColumnComponent {
  @Input() day!: DayOfWeek;
  @Input() exercises: DayExercise[] = [];
  @Input() connectedLists: string[] = [];

  @Output() exercisesChange = new EventEmitter<DayExercise[]>();
  @Output() exerciseDropped = new EventEmitter<{
    day: DayOfWeek;
    exercise: Exercise;
    previousDay?: DayOfWeek;
  }>();
  @Output() exerciseRemoved = new EventEmitter<{ day: DayOfWeek; index: number }>();
  @Output() exerciseConfigChanged = new EventEmitter<{
    day: DayOfWeek;
    index: number;
    config: Partial<DayExercise>;
  }>();

  get dayLabel(): string {
    return DayOfWeekLabels[this.day];
  }

  onDrop(event: CdkDragDrop<DayExercise[], DayExercise[] | Exercise[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.exercises, event.previousIndex, event.currentIndex);
      this.exercisesChange.emit([...this.exercises]);
    } else {
      const draggedItem = event.item.data;

      if (this.isExercise(draggedItem)) {
        const newExercise: DayExercise = {
          exercise: draggedItem,
          order: event.currentIndex + 1,
          sets: 3,
          reps: 12,
          restSeconds: 60,
          suggestedWeight: null,
          isNew: true,
        };
        this.exercises.splice(event.currentIndex, 0, newExercise);
        this.exerciseDropped.emit({ day: this.day, exercise: draggedItem });
      } else {
        transferArrayItem(
          event.previousContainer.data as DayExercise[],
          this.exercises,
          event.previousIndex,
          event.currentIndex
        );
      }
      this.exercisesChange.emit([...this.exercises]);
    }
  }

  onConfigChange(index: number, config: Partial<DayExercise>): void {
    this.exercises[index] = { ...this.exercises[index], ...config };
    this.exerciseConfigChanged.emit({ day: this.day, index, config });
  }

  onRemove(index: number): void {
    this.exercises.splice(index, 1);
    this.exercisesChange.emit([...this.exercises]);
    this.exerciseRemoved.emit({ day: this.day, index });
  }

  private isExercise(item: unknown): item is Exercise {
    return item !== null && typeof item === 'object' && 'muscleGroupId' in item;
  }
}
