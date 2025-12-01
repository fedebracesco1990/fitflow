import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/list.component').then((m) => m.PaymentsListComponent),
    title: 'Pagos',
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/form/form.component').then((m) => m.PaymentFormComponent),
    title: 'Nuevo Pago',
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/form/form.component').then((m) => m.PaymentFormComponent),
    title: 'Editar Pago',
  },
];
