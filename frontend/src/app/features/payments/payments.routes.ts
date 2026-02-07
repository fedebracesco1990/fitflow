import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/list/list.component').then((m) => m.PaymentsListComponent),
        title: 'Pagos',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/form/form.component').then((m) => m.PaymentFormComponent),
        title: 'Editar Pago',
      },
    ],
  },
];
