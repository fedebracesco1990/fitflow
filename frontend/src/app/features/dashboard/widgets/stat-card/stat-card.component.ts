import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent } from '../../../../shared';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'fit-flow-stat-card',
  standalone: true,
  imports: [CardComponent, LucideAngularModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly label = input<string>('');
  readonly icon = input<string>('');
  readonly variant = input<StatCardVariant>('default');
  readonly isLoading = input<boolean>(false);
}
