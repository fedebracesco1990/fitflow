import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoutinesService } from '../../../../core/services';
import { Routine, TemplateCategory, TemplateCategoryLabels } from '../../../../core/models';
import { CardComponent } from '../../../../shared';
import { TemplateCardComponent } from '../../components/template-card/template-card.component';
import { TemplatePreviewDialogComponent } from '../../components/template-preview-dialog/template-preview-dialog.component';

@Component({
  selector: 'fit-flow-templates-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardComponent,
    TemplateCardComponent,
    TemplatePreviewDialogComponent,
  ],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
})
export class TemplatesListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly routinesService = inject(RoutinesService);

  templates = signal<Routine[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  creatingFromTemplate = signal(false);

  categories = Object.values(TemplateCategory);
  categoryLabels = TemplateCategoryLabels;
  selectedCategory = signal<TemplateCategory | ''>('');

  previewDialogOpen = signal(false);
  selectedTemplate = signal<Routine | null>(null);

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.error.set(null);

    const category = this.selectedCategory() || undefined;
    this.routinesService.getTemplates({ category, limit: 50 }).subscribe({
      next: (response) => {
        this.templates.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar plantillas');
        this.loading.set(false);
      },
    });
  }

  onCategoryChange(category: TemplateCategory | ''): void {
    this.selectedCategory.set(category);
    this.loadTemplates();
  }

  onPreviewTemplate(template: Routine): void {
    this.selectedTemplate.set(template);
    this.previewDialogOpen.set(true);
  }

  onUseTemplate(template: Routine): void {
    this.createFromTemplate(template);
  }

  onPreviewConfirmed(): void {
    const template = this.selectedTemplate();
    if (template) {
      this.createFromTemplate(template);
    }
  }

  onPreviewCancelled(): void {
    this.previewDialogOpen.set(false);
    this.selectedTemplate.set(null);
  }

  private createFromTemplate(template: Routine): void {
    this.creatingFromTemplate.set(true);

    this.routinesService.createFromTemplate(template.id).subscribe({
      next: (newRoutine) => {
        this.creatingFromTemplate.set(false);
        this.previewDialogOpen.set(false);
        this.router.navigate(['/training/routines', newRoutine.id, 'builder']);
      },
      error: (err) => {
        this.creatingFromTemplate.set(false);
        this.error.set(err.error?.message || 'Error al crear rutina desde plantilla');
      },
    });
  }
}
