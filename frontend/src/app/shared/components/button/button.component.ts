import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'fit-flow-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);

  // Getters for template (accessed as properties without parentheses)
  protected get btnType(): string {
    return this.type();
  }

  protected get btnClass(): Record<string, boolean> {
    return {
      [`btn--${this.variant()}`]: true,
      [`btn--${this.size()}`]: true,
      'btn--full-width': this.fullWidth(),
      'btn--loading': this.loading(),
    };
  }

  protected get isDisabled(): boolean {
    return this.disabled() || this.loading();
  }

  protected get isLoading(): boolean {
    return this.loading();
  }

  protected get contentHidden(): boolean {
    return this.loading();
  }
}
