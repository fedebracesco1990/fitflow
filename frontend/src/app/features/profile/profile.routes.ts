import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        title: 'Mi Perfil',
        loadComponent: () =>
          import('./pages/view-profile/view-profile.component').then((m) => m.ViewProfileComponent),
      },
      {
        path: 'edit',
        title: 'Editar Perfil',
        loadComponent: () =>
          import('./pages/edit-profile/edit-profile.component').then((m) => m.EditProfileComponent),
      },
      {
        path: 'change-password',
        title: 'Cambiar Contraseña',
        loadComponent: () =>
          import('./pages/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          ),
      },
    ],
  },
];
