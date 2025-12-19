import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Reportes',
        loadComponent: () =>
          import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
      },
    ],
  },
];
