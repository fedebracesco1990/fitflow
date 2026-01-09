import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const EXERCISES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/list/list.component').then((m) => m.ExercisesListComponent),
        title: 'Ejercicios',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.ExerciseFormComponent),
        title: 'Nuevo Ejercicio',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/detail/detail.component').then((m) => m.ExerciseDetailComponent),
        title: 'Detalle de Ejercicio',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.ExerciseFormComponent),
        title: 'Editar Ejercicio',
      },
    ],
  },
];
