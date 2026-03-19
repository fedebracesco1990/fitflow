import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const AUDIT_LOGS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/list/list.component').then((m) => m.AuditLogsListComponent),
        title: 'Logs de Auditoría',
      },
    ],
  },
];
