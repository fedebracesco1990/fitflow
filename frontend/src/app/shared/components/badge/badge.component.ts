import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'fit-flow-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  variant = input<'primary' | 'success' | 'warning' | 'error' | 'neutral'>('primary');
  size = input<'sm' | 'md'>('md');

  protected get badgeClass(): Record<string, boolean> {
    return {
      [`badge--${this.variant()}`]: true,
      [`badge--${this.size()}`]: true,
    };
  }
}
