import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared';

@Component({
  selector: 'fit-flow-behavior-metrics',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './behavior-metrics.component.html',
  styleUrl: './behavior-metrics.component.scss',
})
export class BehaviorMetricsComponent {
  @Input() visitasPromActivos = 0;
  @Input() visitasPromMorosos = 0;
  @Input() rutinasActivas = 0;
}
