import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  UserState,
  LoadProfile,
  NotificationsState,
  SetPermissionStatus,
  SetFcmToken,
} from '../../../../core/store';
import { PushNotificationsService } from '../../../../core/services';
import {
  AvatarComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LoadingSpinnerComponent,
} from '../../../../shared';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'fit-flow-view-profile',
  standalone: true,
  imports: [
    RouterLink,
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    LoadingSpinnerComponent,
    LucideAngularModule,
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
})
export class ViewProfileComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly pushService = inject(PushNotificationsService);

  readonly profile = this.store.selectSignal(UserState.profile);
  readonly isLoading = this.store.selectSignal(UserState.isLoading);
  readonly permissionStatus = this.store.selectSignal(NotificationsState.permissionStatus);

  readonly isEnablingNotifications = signal(false);

  // Use signal to make preference reactive
  readonly userPreferenceSignal = signal<string | null>(null);

  readonly notificationsEnabled = computed(
    () => this.permissionStatus() === 'granted' && this.userPreferenceSignal() === 'enabled'
  );
  readonly notificationsDenied = computed(() => this.permissionStatus() === 'denied');

  ngOnInit(): void {
    if (!this.profile()) {
      this.store.dispatch(new LoadProfile());
    }
    // Load user preference from localStorage
    this.loadUserPreference();
  }

  private loadUserPreference(): void {
    const userId = this.profile()?.id;
    if (userId) {
      const pref = localStorage.getItem(`notification_preference_${userId}`);
      this.userPreferenceSignal.set(pref);
    }
  }

  // Computed properties for template
  readonly profileName = computed(() => this.profile()?.name || '');

  readonly roleLabel = computed(() => {
    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      trainer: 'Entrenador',
      user: 'Usuario',
    };
    return roleLabels[this.profile()?.role || 'user'] || 'Usuario';
  });

  readonly roleBadgeVariant = computed(() => {
    const variants: Record<string, 'primary' | 'success' | 'warning'> = {
      admin: 'warning',
      trainer: 'success',
      user: 'primary',
    };
    return variants[this.profile()?.role || 'user'] || 'primary';
  });

  readonly formattedDate = computed(() => {
    const date = this.profile()?.createdAt;
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  async enableNotifications(): Promise<void> {
    this.isEnablingNotifications.set(true);

    try {
      const permission = await this.pushService.requestPermission();
      this.store.dispatch(new SetPermissionStatus(permission));

      if (permission === 'granted') {
        await this.pushService.initialize();
        const token = await this.pushService.getAndRegisterToken();
        if (token) {
          this.store.dispatch(new SetFcmToken(token));
          // Save user preference with their userId
          const userId = this.profile()?.id;
          if (userId) {
            localStorage.setItem(`notification_preference_${userId}`, 'enabled');
            // Update signal to trigger UI refresh
            this.userPreferenceSignal.set('enabled');
          }
        }
      }
    } finally {
      this.isEnablingNotifications.set(false);
    }
  }
}
