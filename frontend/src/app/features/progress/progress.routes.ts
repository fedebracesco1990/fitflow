import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const PROGRESS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Mi Progreso',
        loadComponent: () =>
          import('./pages/my-progress/my-progress.component').then((m) => m.MyProgressComponent),
      },
    ],
  },
];
