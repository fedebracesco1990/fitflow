import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const ROUTINES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/list/list.component').then((m) => m.RoutinesListComponent),
        title: 'Rutinas',
      },
      {
        path: 'daily/new',
        loadComponent: () =>
          import('./pages/daily-builder/daily-builder.component').then(
            (m) => m.DailyRoutineBuilderComponent
          ),
        title: 'Nueva Rutina Diaria',
      },
      {
        path: 'daily/:id/edit',
        loadComponent: () =>
          import('./pages/daily-builder/daily-builder.component').then(
            (m) => m.DailyRoutineBuilderComponent
          ),
        title: 'Editar Rutina Diaria',
      },
      {
        path: 'weekly/new',
        loadComponent: () =>
          import('./pages/weekly-builder/weekly-builder.component').then(
            (m) => m.WeeklyProgramBuilderComponent
          ),
        title: 'Nuevo Programa Semanal',
      },
      {
        path: 'weekly/:id/edit',
        loadComponent: () =>
          import('./pages/weekly-builder/weekly-builder.component').then(
            (m) => m.WeeklyProgramBuilderComponent
          ),
        title: 'Editar Programa Semanal',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.RoutineFormComponent),
        title: 'Nueva Rutina',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.RoutineFormComponent),
        title: 'Editar Rutina',
      },
    ],
  },
];
