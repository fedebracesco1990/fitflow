import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'fit-flow-tooltip',
  standalone: true,
  imports: [NgClass],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
})
export class TooltipComponent {
  content = input.required<string>();
  position = input<'top' | 'bottom' | 'left' | 'right'>('top');
}
