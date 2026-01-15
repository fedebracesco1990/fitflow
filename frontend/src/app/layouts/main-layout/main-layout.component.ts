import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { AuthState, Logout, LogoutSuccess, NotificationsState } from '../../core/store';
import { SidebarComponent, MenuItem, SidebarUser } from '../sidebar/sidebar.component';
import { LucideAngularModule } from 'lucide-angular';
import {
  NotificationBellComponent,
  NotificationCenterComponent,
  NotificationPromptComponent,
  PrCelebrationModalComponent,
  PwaUpdatePromptComponent,
  PwaInstallPromptComponent,
} from '../../shared/components';
import { PwaService } from '../../core/services';

@Component({
  selector: 'fit-flow-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    LucideAngularModule,
    NotificationBellComponent,
    NotificationCenterComponent,
    NotificationPromptComponent,
    PrCelebrationModalComponent,
    PwaUpdatePromptComponent,
    PwaInstallPromptComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);
  readonly pwaService = inject(PwaService);

  readonly user = this.store.selectSignal(AuthState.user);
  readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);
  readonly isTrainer = this.store.selectSignal(AuthState.isTrainer);

  readonly sidebarCollapsed = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly notificationCenterOpen = signal(false);
  readonly showNotificationPrompt = signal(false);

  readonly permissionStatus = this.store.selectSignal(NotificationsState.permissionStatus);

  readonly sidebarUser = computed<SidebarUser | null>(() => {
    const u = this.user();
    if (!u) return null;
    return {
      name: u.email.split('@')[0],
      email: u.email,
      role: u.role,
    };
  });

  readonly menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [{ label: 'Panel', icon: 'layout-dashboard', route: '/dashboard' }];

    if (this.isAdmin()) {
      items.push(
        { label: 'Reportes', icon: 'bar-chart-3', route: '/reports' },
        { label: 'Directorio', icon: 'users', route: '/users' },
        { label: 'Membresías', icon: 'id-card', route: '/memberships' },
        { label: 'Tipos', icon: 'tags', route: '/membership-types' },
        { label: 'Pagos', icon: 'credit-card', route: '/payments' },
        { label: 'Notificaciones', icon: 'bell', route: '/notifications-admin' }
      );
    }

    if (this.isAdmin() || this.isTrainer()) {
      items.push(
        { label: 'Entrenamiento', icon: 'dumbbell', route: '/training' },
        { label: 'Ingresos', icon: 'qr-code', route: '/access/scan' },
        { label: 'Asistencias', icon: 'calendar-check', route: '/access/stats' }
      );
    }

    items.push(
      { label: 'Mis Rutinas', icon: 'list-checks', route: '/my-routines' },
      { label: 'Mi Perfil', icon: 'user', route: '/profile' }
    );

    return items;
  });

  ngOnInit(): void {
    setTimeout(() => {
      if (this.permissionStatus() === 'default') {
        this.showNotificationPrompt.set(true);
      }
    }, 3000);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleNotificationCenter(): void {
    this.notificationCenterOpen.update((v) => !v);
  }

  closeNotificationCenter(): void {
    this.notificationCenterOpen.set(false);
  }

  dismissNotificationPrompt(): void {
    this.showNotificationPrompt.set(false);
  }

  async handlePwaInstall(): Promise<void> {
    const installed = await this.pwaService.promptInstall();
    if (!installed) {
      this.pwaService.dismissInstallPrompt();
    }
  }

  handlePwaInstallDismiss(): void {
    this.pwaService.dismissInstallPrompt();
  }

  handlePwaUpdate(): void {
    this.pwaService.applyUpdate();
  }

  handlePwaUpdateDismiss(): void {
    this.pwaService.dismissUpdate();
  }

  logout(): void {
    this.actions$.pipe(ofActionSuccessful(LogoutSuccess), take(1)).subscribe(() => {
      this.router.navigate(['/login']);
    });
    this.store.dispatch(new Logout());
  }
}
