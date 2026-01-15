import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateCategory, TemplateCategoryLabels } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-save-as-template-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './save-as-template-dialog.component.html',
  styleUrl: './save-as-template-dialog.component.scss',
})
export class SaveAsTemplateDialogComponent {
  isOpen = input(false);
  routineName = input('');
  saving = input(false);

  confirmed = output<{ category: TemplateCategory; name?: string }>();
  cancelled = output<void>();

  categories = Object.values(TemplateCategory);
  categoryLabels = TemplateCategoryLabels;

  selectedCategory = signal<TemplateCategory>(TemplateCategory.STRENGTH);
  customName = signal('');

  onConfirm(): void {
    this.confirmed.emit({
      category: this.selectedCategory(),
      name: this.customName() || undefined,
    });
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onCancel();
    }
  }

  private resetForm(): void {
    this.selectedCategory.set(TemplateCategory.STRENGTH);
    this.customName.set('');
  }
}
