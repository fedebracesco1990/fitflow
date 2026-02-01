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
  OfflineBannerComponent,
  SyncStatusComponent,
} from '../../shared/components';
import { PwaService, PushNotificationsService, SyncManagerService } from '../../core/services';

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
    OfflineBannerComponent,
    SyncStatusComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);
  readonly pwaService = inject(PwaService);
  private readonly syncManager = inject(SyncManagerService);
  private readonly pushService = inject(PushNotificationsService);

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

  private getNotificationPreferenceKey(): string {
    const userId = this.user()?.userId;
    return userId ? `notification_preference_${userId}` : 'notification_preference_guest';
  }

  ngOnInit(): void {
    setTimeout(() => {
      const support = this.pushService.checkSupport();
      const status = this.permissionStatus();
      const userId = this.user()?.userId;
      const preferenceKey = this.getNotificationPreferenceKey();
      const userPreference = localStorage.getItem(preferenceKey);

      console.log('[Notifications] Support check:', support);
      console.log('[Notifications] Permission status:', status);
      console.log('[Notifications] User preference:', userPreference);

      // Show prompt if:
      // 1. Browser permission is 'default' (never asked) - show to ask permission
      // 2. Browser permission is 'granted' but THIS user hasn't set their preference yet
      // 3. User hasn't dismissed it for this account
      const shouldShowPrompt =
        (status === 'default' ||
          support.requiresPWA ||
          (status === 'granted' && !userPreference)) &&
        userPreference !== 'dismissed';

      if (shouldShowPrompt && userId) {
        console.log('[Notifications] Showing prompt for user:', userId);
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
    console.log('[Notifications] User dismissed prompt, saving to localStorage');
    localStorage.setItem(this.getNotificationPreferenceKey(), 'dismissed');
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
