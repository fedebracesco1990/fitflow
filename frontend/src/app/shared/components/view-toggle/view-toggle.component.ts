import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type ViewMode = 'grid' | 'list';

@Component({
  selector: 'fit-flow-view-toggle',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="view-toggle">
      <button
        type="button"
        class="toggle-btn"
        [class.active]="mode === 'grid'"
        (click)="setMode('grid')"
        title="Vista de cuadrícula"
      >
        <lucide-icon name="layout-grid" [size]="18"></lucide-icon>
      </button>
      <button
        type="button"
        class="toggle-btn"
        [class.active]="mode === 'list'"
        (click)="setMode('list')"
        title="Vista de lista"
      >
        <lucide-icon name="list" [size]="18"></lucide-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .view-toggle {
        display: flex;
        gap: 0.25rem;
        background: #f3f4f6;
        padding: 0.25rem;
        border-radius: 0.5rem;
      }

      .toggle-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border: none;
        background: transparent;
        color: #6b7280;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .toggle-btn:hover {
        color: #1f2937;
        background: #e5e7eb;
      }

      .toggle-btn.active {
        background: #ffffff;
        color: #667eea;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class ViewToggleComponent {
  @Input() mode: ViewMode = 'grid';
  @Output() modeChange = new EventEmitter<ViewMode>();

  setMode(newMode: ViewMode): void {
    if (this.mode !== newMode) {
      this.mode = newMode;
      this.modeChange.emit(newMode);
    }
  }
}
