import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { AuthState, Logout, LogoutSuccess } from '../../core/store';
import { SidebarComponent, MenuItem, SidebarUser } from '../sidebar/sidebar.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, LucideAngularModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);

  readonly user = this.store.selectSignal(AuthState.user);
  readonly isAdmin = this.store.selectSignal(AuthState.isAdmin);
  readonly isTrainer = this.store.selectSignal(AuthState.isTrainer);

  readonly sidebarCollapsed = signal(false);
  readonly mobileMenuOpen = signal(false);

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
        { label: 'Finanzas', icon: 'bar-chart-3', route: '/dashboard/financial' },
        { label: 'Membresías', icon: 'id-card', route: '/memberships' },
        { label: 'Tipos', icon: 'tags', route: '/membership-types' },
        { label: 'Pagos', icon: 'credit-card', route: '/payments' },
        { label: 'Ejercicios', icon: 'dumbbell', route: '/exercises' }
      );
    }

    if (this.isAdmin() || this.isTrainer()) {
      items.push(
        { label: 'Rutinas', icon: 'clipboard-list', route: '/routines' },
        { label: 'Escanear QR', icon: 'qr-code', route: '/access/scan' },
        { label: 'Asistencias', icon: 'calendar-check', route: '/access/stats' }
      );
    }

    items.push(
      { label: 'Mis Rutinas', icon: 'list-checks', route: '/my-routines' },
      { label: 'Mi Perfil', icon: 'user', route: '/profile' }
    );

    return items;
  });

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.actions$.pipe(ofActionSuccessful(LogoutSuccess), take(1)).subscribe(() => {
      this.router.navigate(['/login']);
    });
    this.store.dispatch(new Logout());
  }
}
