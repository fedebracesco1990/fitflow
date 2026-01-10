import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Routine,
  DayOfWeek,
  DayOfWeekLabels,
  TemplateCategoryLabels,
  TemplateCategory,
} from '../../../../core/models';
import { ButtonComponent, BadgeComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-template-preview-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent],
  templateUrl: './template-preview-dialog.component.html',
  styleUrl: './template-preview-dialog.component.scss',
})
export class TemplatePreviewDialogComponent {
  isOpen = input(false);
  template = input<Routine | null>(null);
  loading = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  days = Object.values(DayOfWeek);
  dayLabels = DayOfWeekLabels;
  categoryLabels = TemplateCategoryLabels;

  exercisesByDay = computed(() => {
    const t = this.template();
    if (!t?.exercises) return {};

    const grouped: Record<string, typeof t.exercises> = {};
    for (const day of this.days) {
      grouped[day] = t.exercises.filter((e) => e.dayOfWeek === day);
    }
    return grouped;
  });

  totalExercises = computed(() => {
    return this.template()?.exercises?.length || 0;
  });

  getCategoryLabel(category: TemplateCategory | undefined): string {
    return category ? this.categoryLabels[category] : 'Sin categoría';
  }

  onUseTemplate(): void {
    this.confirmed.emit();
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
