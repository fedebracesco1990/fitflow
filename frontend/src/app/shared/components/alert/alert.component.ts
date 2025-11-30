import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'fit-flow-alert',
  standalone: true,
  imports: [NgClass],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  type = input<'success' | 'error' | 'warning' | 'info'>('info');
  message = input.required<string>();
  dismissible = input<boolean>(false);
  dismissed = output<void>();

  protected get alertClass(): Record<string, boolean> {
    return { [`alert--${this.type()}`]: true };
  }

  protected get alertMessage(): string {
    return this.message();
  }

  protected get iconSymbol(): string {
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return icons[this.type()];
  }

  protected get isDismissible(): boolean {
    return this.dismissible();
  }

  dismiss(): void {
    this.dismissed.emit();
  }
}
