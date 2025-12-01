import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'fit-flow-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  shadow = input<boolean>(true);
  variant = input<'default' | 'gradient' | 'flat'>('default');
  noBorder = input<boolean>(false);

  protected get cardClass(): Record<string, boolean> {
    return {
      [`card--padding-${this.padding()}`]: true,
      'card--shadow': this.shadow() && this.variant() !== 'gradient',
      [`card--${this.variant()}`]: this.variant() !== 'default',
      'card--no-border': this.noBorder(),
    };
  }
}
