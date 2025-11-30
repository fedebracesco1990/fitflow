import { Component, input } from '@angular/core';

@Component({
  selector: 'fit-flow-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  icon = input<string>('📭');
  title = input.required<string>();
  description = input<string>('');

  protected get emptyIcon(): string {
    return this.icon();
  }

  protected get emptyTitle(): string {
    return this.title();
  }

  protected get emptyDescription(): string {
    return this.description();
  }

  protected get hasDescription(): boolean {
    return !!this.description();
  }
}
