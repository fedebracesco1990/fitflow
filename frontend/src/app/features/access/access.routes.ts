import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const ACCESS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'scan',
        pathMatch: 'full',
      },
      {
        path: 'scan',
        title: 'Escanear QR',
        loadComponent: () =>
          import('./pages/scan-qr/scan-qr.component').then((m) => m.ScanQrComponent),
      },
      {
        path: 'logs',
        title: 'Historial de Accesos',
        loadComponent: () =>
          import('./pages/access-logs/access-logs.component').then((m) => m.AccessLogsComponent),
      },
      {
        path: 'stats',
        title: 'Estadísticas de Asistencia',
        loadComponent: () =>
          import('./pages/attendance-stats/attendance-stats.component').then(
            (m) => m.AttendanceStatsComponent
          ),
      },
    ],
  },
];
