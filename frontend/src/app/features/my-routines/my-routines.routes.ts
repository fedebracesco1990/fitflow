import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const MY_ROUTINES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/week/week.component').then((m) => m.MyWeekComponent),
        title: 'Mis Rutinas',
      },
      {
        path: ':id/start',
        loadComponent: () =>
          import('./pages/workout/workout.component').then((m) => m.WorkoutComponent),
        title: 'Entrenamiento',
      },
    ],
  },
];
