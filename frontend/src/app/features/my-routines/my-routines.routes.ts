import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const MY_ROUTINES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/workout-list/workout-list.component').then(
            (m) => m.WorkoutListComponent
          ),
        title: 'Mis Rutinas',
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
          import('./components/workout-active/workout-active.component').then(
            (m) => m.WorkoutActiveComponent
          ),
        title: 'Entrenamiento Activo',
      },
      {
        path: ':id/exercise/:exerciseId',
        loadComponent: () =>
          import('./components/exercise-sets/exercise-sets.component').then(
            (m) => m.ExerciseSetsComponent
          ),
        title: 'Ejercicio',
      },
    ],
  },
];
