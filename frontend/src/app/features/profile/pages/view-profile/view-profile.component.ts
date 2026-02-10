import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import {
  UserState,
  LoadProfile,
  NotificationsState,
  SetPermissionStatus,
  SetFcmToken,
  AuthState,
} from '../../../../core/store';
import { PushNotificationsService } from '../../../../core/services';
import {
  AvatarComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ConfirmDialogComponent,
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
    ConfirmDialogComponent,
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
  private readonly user = this.store.selectSignal(AuthState.user);

  readonly isEnablingNotifications = signal(false);
  readonly isDisablingNotifications = signal(false);
  readonly showConfirmDialog = signal(false);
  readonly pendingAction = signal<'enable' | 'disable' | null>(null);

  // Use signal to make preference reactive
  readonly userPreferenceSignal = signal<string | null>(null);

  // Computed properties for dialog
  readonly dialogTitle = computed(() =>
    this.pendingAction() === 'enable' ? 'Activar notificaciones' : 'Desactivar notificaciones'
  );
  readonly dialogMessage = computed(() =>
    this.pendingAction() === 'enable'
      ? 'Recibirás alertas sobre vencimientos de membresía, recordatorios de entrenamiento y más.'
      : 'Dejarás de recibir alertas sobre vencimientos, recordatorios y récords personales.'
  );
  readonly dialogConfirmText = computed(() =>
    this.pendingAction() === 'enable' ? 'Activar' : 'Desactivar'
  );
  readonly dialogVariant = computed<'primary' | 'warning'>(() =>
    this.pendingAction() === 'enable' ? 'primary' : 'warning'
  );

  readonly notificationsEnabled = computed(() => {
    const status = this.permissionStatus();
    const preference = this.userPreferenceSignal();
    // If browser permission is granted and user hasn't explicitly disabled, consider enabled
    // This handles the case where user accepted via prompt but token registration failed
    return status === 'granted' && preference !== 'disabled';
  });
  readonly notificationsDenied = computed(() => this.permissionStatus() === 'denied');

  ngOnInit(): void {
    if (!this.profile()) {
      this.store.dispatch(new LoadProfile());
    }
    // Load user preference from localStorage
    this.loadUserPreference();
  }

  private getPreferenceKey(): string | null {
    const userId = this.user()?.userId;
    return userId ? `notification_preference_${userId}` : null;
  }

  private loadUserPreference(): void {
    const key = this.getPreferenceKey();
    if (key) {
      this.userPreferenceSignal.set(localStorage.getItem(key));
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

  openToggleDialog(action: 'enable' | 'disable'): void {
    this.pendingAction.set(action);
    this.showConfirmDialog.set(true);
  }

  onDialogConfirm(): void {
    this.showConfirmDialog.set(false);
    if (this.pendingAction() === 'enable') {
      this.enableNotifications();
    } else {
      this.disableNotifications();
    }
    this.pendingAction.set(null);
  }

  onDialogCancel(): void {
    this.showConfirmDialog.set(false);
    this.pendingAction.set(null);
  }

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
          const key = this.getPreferenceKey();
          if (key) {
            localStorage.setItem(key, 'enabled');
            this.userPreferenceSignal.set('enabled');
          }
        }
      }
    } finally {
      this.isEnablingNotifications.set(false);
    }
  }

  async disableNotifications(): Promise<void> {
    this.isDisablingNotifications.set(true);

    try {
      const fcmToken = this.store.selectSnapshot(NotificationsState.fcmToken);
      if (fcmToken) {
        await this.pushService.unregisterToken(fcmToken);
        this.store.dispatch(new SetFcmToken(null));
      }

      const key = this.getPreferenceKey();
      if (key) {
        localStorage.setItem(key, 'disabled');
        this.userPreferenceSignal.set('disabled');
      }
    } finally {
      this.isDisablingNotifications.set(false);
    }
  }
}
