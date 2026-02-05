import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-edit-set-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './edit-set-dialog.component.html',
  styleUrl: './edit-set-dialog.component.scss',
})
export class EditSetDialogComponent {
  isOpen = input(false);
  setNumber = input(1);
  initialReps = input(10);
  initialWeight = input(0);

  saved = output<{ reps: number; weight: number }>();
  cancelled = output<void>();

  reps = signal(10);
  weight = signal(0);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.reps.set(this.initialReps());
        this.weight.set(this.initialWeight());
      }
    });
  }

  incrementReps(): void {
    this.reps.update((v) => v + 1);
  }

  decrementReps(): void {
    this.reps.update((v) => Math.max(1, v - 1));
  }

  incrementWeight(): void {
    this.weight.update((v) => v + 1);
  }

  decrementWeight(): void {
    this.weight.update((v) => Math.max(0, v - 1));
  }

  onSave(): void {
    this.saved.emit({ reps: this.reps(), weight: this.weight() });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onCancel();
    }
  }
}
