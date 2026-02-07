import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const MEMBERSHIPS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Membresías',
        loadComponent: () =>
          import('./pages/list/list.component').then((m) => m.MembershipsListComponent),
      },
      {
        path: ':id/edit',
        title: 'Editar Membresía',
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.MembershipFormComponent),
      },
    ],
  },
];
