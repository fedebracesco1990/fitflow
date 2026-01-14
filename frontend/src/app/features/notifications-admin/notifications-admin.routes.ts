import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const NOTIFICATIONS_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Enviar Notificaciones',
        loadComponent: () =>
          import('./pages/send-notifications/send-notifications.component').then(
            (m) => m.SendNotificationsComponent
          ),
      },
    ],
  },
];
