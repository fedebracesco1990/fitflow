import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'fit-flow-loading-spinner',
  standalone: true,
  imports: [NgClass],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<'primary' | 'white'>('primary');

  protected get spinnerClass(): Record<string, boolean> {
    return {
      [`spinner--${this.size()}`]: true,
      [`spinner--${this.color()}`]: true,
    };
  }
}
