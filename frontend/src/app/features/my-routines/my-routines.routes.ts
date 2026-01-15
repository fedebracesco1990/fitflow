import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const MY_ROUTINES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'today',
        pathMatch: 'full',
      },
      {
        path: 'today',
        loadComponent: () =>
          import('./pages/today/today.component').then((m) => m.TodayRoutineComponent),
        title: 'Mi Rutina de Hoy',
      },
      {
        path: 'week',
        loadComponent: () => import('./pages/week/week.component').then((m) => m.MyWeekComponent),
        title: 'Mi Semana',
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/history/history.component').then((m) => m.RoutineHistoryComponent),
        title: 'Historial de Rutinas',
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
