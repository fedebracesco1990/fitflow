import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

export const usersRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/list/list.component').then((m) => m.UsersListComponent),
      },
      {
        path: 'new',
        title: 'Nuevo Usuario',
        loadComponent: () => import('./pages/form/form.component').then((m) => m.UserFormComponent),
      },
      {
        path: ':id',
        title: 'Perfil de Usuario',
        loadComponent: () =>
          import('./pages/detail/detail.component').then((m) => m.UserDetailComponent),
      },
      {
        path: ':id/edit',
        title: 'Editar Usuario',
        loadComponent: () =>
          import('./pages/edit/edit.component').then((m) => m.UserEditComponent),
      },
    ],
  },
];
