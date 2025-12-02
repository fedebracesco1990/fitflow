import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards';
import { AuthLayoutComponent } from './layouts';
import { Role } from './core/models';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        title: 'Iniciar Sesión',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Crear Cuenta',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'forgot-password',
        title: 'Recuperar Contraseña',
        loadComponent: () =>
          import('./features/auth/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        title: 'Nueva Contraseña',
        loadComponent: () =>
          import('./features/auth/pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'membership-types',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () =>
      import('./features/membership-types/membership-types.routes').then(
        (m) => m.MEMBERSHIP_TYPES_ROUTES
      ),
  },
  {
    path: 'payments',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () =>
      import('./features/payments/payments.routes').then((m) => m.PAYMENTS_ROUTES),
  },
  {
    path: 'exercises',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () =>
      import('./features/exercises/exercises.routes').then((m) => m.EXERCISES_ROUTES),
  },
  {
    path: 'routines',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN, Role.TRAINER] },
    loadChildren: () =>
      import('./features/routines/routines.routes').then((m) => m.ROUTINES_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
