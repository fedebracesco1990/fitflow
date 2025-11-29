import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Inicio',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
    ],
  },
];
