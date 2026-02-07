import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';
import { roleGuard } from '../../core/guards';
import { Role } from '../../core/models';

export const MEMBERSHIP_TYPES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Tipos de Membresía',
        loadComponent: () =>
          import('./pages/list/list.component').then((m) => m.MembershipTypesListComponent),
      },
      {
        path: ':id/edit',
        title: 'Editar Tipo de Membresía',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.MembershipTypeFormComponent),
      },
    ],
  },
];
