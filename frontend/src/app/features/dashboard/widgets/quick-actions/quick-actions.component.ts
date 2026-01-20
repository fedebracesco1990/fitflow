import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared';

export interface QuickAction {
  label: string;
  icon: string;
  route: string;
  variant?: 'primary' | 'secondary';
}

@Component({
  selector: 'fit-flow-quick-actions',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, ButtonComponent],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss',
})
export class QuickActionsComponent {
  readonly title = input<string>('⚡ Acciones Rápidas');
  readonly actions = input.required<QuickAction[]>();
}
