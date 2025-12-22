import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../../core/store';
import { RoutinesListComponent } from '../../../routines/pages/list/list.component';
import { ExercisesListComponent } from '../../../exercises/pages/list/list.component';

type TabType = 'routines' | 'exercises' | 'classes';

@Component({
  selector: 'fit-flow-training',
  standalone: true,
  imports: [CommonModule, RoutinesListComponent, ExercisesListComponent],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent {
  private readonly store = inject(Store);

  readonly activeTab = signal<TabType>('routines');
  readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }
}
