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
      {
        path: 'routines/daily/new',
        loadComponent: () =>
          import('../routines/pages/daily-builder/daily-builder.component').then(
            (m) => m.DailyRoutineBuilderComponent
          ),
        title: 'Nueva Rutina Diaria',
      },
      {
        path: 'routines/daily/:id/edit',
        loadComponent: () =>
          import('../routines/pages/daily-builder/daily-builder.component').then(
            (m) => m.DailyRoutineBuilderComponent
          ),
        title: 'Editar Rutina Diaria',
      },
      {
        path: 'routines/weekly/new',
        loadComponent: () =>
          import('../routines/pages/weekly-builder/weekly-builder.component').then(
            (m) => m.WeeklyProgramBuilderComponent
          ),
        title: 'Nuevo Programa Semanal',
      },
      {
        path: 'routines/weekly/:id/edit',
        loadComponent: () =>
          import('../routines/pages/weekly-builder/weekly-builder.component').then(
            (m) => m.WeeklyProgramBuilderComponent
          ),
        title: 'Editar Programa Semanal',
      },
      {
        path: 'routines/templates',
        loadComponent: () =>
          import('../routines/pages/templates/templates.component').then(
            (m) => m.TemplatesListComponent
          ),
        title: 'Plantillas de Rutinas',
      },
      {
        path: 'routines/:id/builder',
        loadComponent: () =>
          import('../routines/pages/builder/builder.component').then(
            (m) => m.RoutineBuilderComponent
          ),
        title: 'Editar Rutina',
      },
      {
        path: 'routines/:id/edit',
        loadComponent: () =>
          import('../routines/pages/form/form.component').then((m) => m.RoutineFormComponent),
        title: 'Editar Rutina',
      },
    ],
  },
];
