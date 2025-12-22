import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const TRAINING_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/training/training.component').then((m) => m.TrainingComponent),
        title: 'Gestión de Entrenamiento',
      },
    ],
  },
];
