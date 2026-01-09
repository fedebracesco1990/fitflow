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
        path: 'new',
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.RoutineFormComponent),
        title: 'Nueva Rutina',
      },
      {
        path: 'builder',
        loadComponent: () =>
          import('./pages/builder/builder.component').then((m) => m.RoutineBuilderComponent),
        title: 'Constructor de Rutinas',
      },
      {
        path: ':id/builder',
        loadComponent: () =>
          import('./pages/builder/builder.component').then((m) => m.RoutineBuilderComponent),
        title: 'Editar Rutina',
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
