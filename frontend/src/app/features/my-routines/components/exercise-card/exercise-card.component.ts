import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExerciseWithHistory } from '../../../../core/models';

@Component({
  selector: 'fit-flow-exercise-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exercise-card.component.html',
  styleUrl: './exercise-card.component.scss',
})
export class ExerciseCardComponent {
  @Input({ required: true }) exercise!: ExerciseWithHistory;
  @Input() showHistory = true;

  get hasHistory(): boolean {
    return !!this.exercise.lastWorkout && this.exercise.lastWorkout.sets.length > 0;
  }

  get lastWeight(): number | null {
    if (!this.hasHistory) return null;
    const sets = this.exercise.lastWorkout!.sets;
    const weightsWithValue = sets.filter((s) => s.weight !== null);
    if (weightsWithValue.length === 0) return null;
    return weightsWithValue[weightsWithValue.length - 1].weight;
  }

  get displayWeight(): string {
    if (this.exercise.suggestedWeight) {
      return `${this.exercise.suggestedWeight} kg`;
    }
    if (this.lastWeight) {
      return `${this.lastWeight} kg (anterior)`;
    }
    return 'Sin peso asignado';
  }

  readonly placeholderImage = 'assets/images/exercise-placeholder.svg';
}
