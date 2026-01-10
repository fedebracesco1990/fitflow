import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Routine,
  TemplateCategory,
  TemplateCategoryLabels,
  DifficultyLabels,
  Difficulty,
} from '../../../../core/models';
import { BadgeComponent, CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-template-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent, CardComponent],
  templateUrl: './template-card.component.html',
  styleUrl: './template-card.component.scss',
})
export class TemplateCardComponent {
  template = input.required<Routine>();

  previewClicked = output<Routine>();
  useClicked = output<Routine>();

  categoryLabels = TemplateCategoryLabels;
  difficultyLabels = DifficultyLabels;

  getCategoryLabel(category: TemplateCategory | undefined): string {
    return category ? this.categoryLabels[category] : 'Sin categoría';
  }

  getDifficultyVariant(difficulty: Difficulty): 'success' | 'warning' | 'error' {
    const variantMap = {
      [Difficulty.BEGINNER]: 'success' as const,
      [Difficulty.INTERMEDIATE]: 'warning' as const,
      [Difficulty.ADVANCED]: 'error' as const,
    };
    return variantMap[difficulty];
  }

  onPreview(): void {
    this.previewClicked.emit(this.template());
  }

  onUse(): void {
    this.useClicked.emit(this.template());
  }
}
