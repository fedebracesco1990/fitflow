import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { RoutineType } from '../../../../core/models';
import { AuthState } from '../../../../core/store';
import { RoutinesListComponent } from '../../../routines/pages/list/list.component';
import { ExercisesListComponent } from '../../../exercises/pages/list/list.component';
import { RoutineTypeSelectDialogComponent } from '../../../routines/components/routine-type-select-dialog/routine-type-select-dialog.component';

type TabType = 'routines' | 'exercises' | 'classes';

@Component({
  selector: 'fit-flow-training',
  standalone: true,
  imports: [
    CommonModule,
    RoutinesListComponent,
    ExercisesListComponent,
    RoutineTypeSelectDialogComponent,
  ],
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
})
export class TrainingComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly activeTab = signal<TabType>('routines');
  readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);
  readonly showTypeModal = signal(false);

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  getTabLabel(): string {
    const labels: Record<TabType, string> = {
      routines: 'Rutinas',
      exercises: 'Ejercicios',
      classes: 'Clases',
    };
    return labels[this.activeTab()];
  }

  openNewRoutineModal(): void {
    this.showTypeModal.set(true);
  }

  onTypeSelected(type: RoutineType): void {
    this.showTypeModal.set(false);
    const route =
      type === RoutineType.DAILY ? '/training/routines/daily/new' : '/training/routines/weekly/new';
    this.router.navigate([route]);
  }

  onTypeModalCancelled(): void {
    this.showTypeModal.set(false);
  }
}
