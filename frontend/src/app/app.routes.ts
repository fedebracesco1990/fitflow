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
    path: 'memberships',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () =>
      import('./features/memberships/memberships.routes').then((m) => m.MEMBERSHIPS_ROUTES),
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
    data: { roles: [Role.ADMIN, Role.TRAINER] },
    loadChildren: () =>
      import('./features/exercises/exercises.routes').then((m) => m.EXERCISES_ROUTES),
  },
  {
    path: 'training',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN, Role.TRAINER] },
    loadChildren: () =>
      import('./features/training/training.routes').then((m) => m.TRAINING_ROUTES),
  },
  {
    path: 'access',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN, Role.TRAINER] },
    loadChildren: () => import('./features/access/access.routes').then((m) => m.ACCESS_ROUTES),
  },
  {
    path: 'my-routines',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/my-routines/my-routines.routes').then((m) => m.MY_ROUTINES_ROUTES),
  },
  {
    path: 'my-progress',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/progress/progress.routes').then((m) => m.PROGRESS_ROUTES),
  },
  {
    path: 'reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () => import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
  },
  {
    path: 'notifications-admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () =>
      import('./features/notifications-admin/notifications-admin.routes').then(
        (m) => m.NOTIFICATIONS_ADMIN_ROUTES
      ),
  },
  {
    path: 'audit-logs',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    loadChildren: () =>
      import('./features/audit-logs/audit-logs.routes').then((m) => m.AUDIT_LOGS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
