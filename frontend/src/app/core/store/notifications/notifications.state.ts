import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  PushNotificationsService,
  PushNotification,
  NotificationPermissionStatus,
} from '../../services/push-notifications.service';
import { NotificationStorageService } from '../../services/notification-storage.service';
import { AuthState } from '../auth/auth.state';
import {
  InitializeNotifications,
  SetPermissionStatus,
  AddNotification,
  MarkAsRead,
  MarkAllAsRead,
  RemoveNotification,
  ClearAllNotifications,
  SetFcmToken,
} from './notifications.actions';

export interface NotificationsStateModel {
  notifications: PushNotification[];
  permissionStatus: NotificationPermissionStatus;
  fcmToken: string | null;
  isInitialized: boolean;
}

const defaults: NotificationsStateModel = {
  notifications: [],
  permissionStatus: 'default',
  fcmToken: null,
  isInitialized: false,
};

@State<NotificationsStateModel>({
  name: 'notifications',
  defaults,
})
@Injectable()
export class NotificationsState {
  private readonly pushService = inject(PushNotificationsService);
  private readonly storageService = inject(NotificationStorageService);
  private readonly store = inject(Store);
  private visibilityListenerRegistered = false;

  @Selector()
  static notifications(state: NotificationsStateModel): PushNotification[] {
    return state.notifications;
  }

  @Selector()
  static unreadCount(state: NotificationsStateModel): number {
    return state.notifications.filter((n) => !n.read).length;
  }

  @Selector()
  static hasUnread(state: NotificationsStateModel): boolean {
    return state.notifications.some((n) => !n.read);
  }

  @Selector()
  static permissionStatus(state: NotificationsStateModel): NotificationPermissionStatus {
    return state.permissionStatus;
  }

  @Selector()
  static isInitialized(state: NotificationsStateModel): boolean {
    return state.isInitialized;
  }

  @Selector()
  static fcmToken(state: NotificationsStateModel): string | null {
    return state.fcmToken;
  }

  @Action(InitializeNotifications)
  async initialize(ctx: StateContext<NotificationsStateModel>) {
    const state = ctx.getState();
    if (state.isInitialized) {
      console.log('[NotificationsState] Already initialized, skipping');
      return;
    }

    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    const isAuthInitialized = this.store.selectSnapshot(AuthState.isInitialized);

    if (!isAuthenticated || !isAuthInitialized) {
      console.log('[NotificationsState] Not authenticated, skipping initialization');
      return;
    }

    console.log('[NotificationsState] Initializing push service...');
    await this.pushService.initialize();

    const permissionStatus = this.pushService.getPermissionStatus();
    console.log('[NotificationsState] Permission status:', permissionStatus);
    ctx.patchState({ permissionStatus, isInitialized: true });

    // Only register token if user has explicitly enabled notifications for their account
    const user = this.store.selectSnapshot(AuthState.user);
    const userId = user?.userId;
    const userPreference = userId
      ? localStorage.getItem(`notification_preference_${userId}`)
      : null;
    console.log('[NotificationsState] User preference:', userPreference);

    // Register token ONLY if: permission is granted AND user explicitly enabled (not just browser permission)
    if (permissionStatus === 'granted' && userPreference === 'enabled') {
      const token = await this.pushService.getAndRegisterToken();
      if (token) {
        console.log('[NotificationsState] FCM token registered');
        ctx.patchState({ fcmToken: token });
      }

      // Only sync notifications for users who have enabled them
      console.log('[NotificationsState] Loading notifications from IndexedDB...');
      await this.syncFromIndexedDB(ctx);
    } else if (permissionStatus === 'granted' && !userPreference) {
      console.log('[NotificationsState] Browser has permission but user has not opted in yet');
      // Clear any notifications from other users in IndexedDB
      ctx.patchState({ notifications: [] });
    } else {
      // User has not enabled notifications, don't load from IndexedDB
      ctx.patchState({ notifications: [] });
    }

    console.log('[NotificationsState] Registering foreground message listener...');
    this.pushService.onForegroundMessage(async (notification) => {
      console.log('[NotificationsState] Received foreground notification:', notification);
      await this.storageService.saveNotification(notification);
      ctx.dispatch(new AddNotification(notification));
    });

    this.registerVisibilityListener(ctx);
    console.log('[NotificationsState] Initialization complete');
  }

  private async syncFromIndexedDB(ctx: StateContext<NotificationsStateModel>): Promise<void> {
    try {
      const storedNotifications = await this.storageService.getAllNotifications();
      console.log(
        '[NotificationsState] Loaded notifications from IndexedDB:',
        storedNotifications.length
      );
      if (storedNotifications.length > 0) {
        ctx.patchState({ notifications: storedNotifications });
      }
    } catch (error) {
      console.error('[NotificationsState] Failed to load from IndexedDB:', error);
    }
  }

  private registerVisibilityListener(ctx: StateContext<NotificationsStateModel>): void {
    if (this.visibilityListenerRegistered) return;
    this.visibilityListenerRegistered = true;

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        console.log('[NotificationsState] App became visible, syncing notifications...');
        await this.syncFromIndexedDB(ctx);
      }
    });
  }

  @Action(SetPermissionStatus)
  setPermissionStatus(ctx: StateContext<NotificationsStateModel>, action: SetPermissionStatus) {
    ctx.patchState({ permissionStatus: action.payload });
  }

  @Action(AddNotification)
  addNotification(ctx: StateContext<NotificationsStateModel>, action: AddNotification) {
    const state = ctx.getState();
    const exists = state.notifications.some((n) => n.id === action.payload.id);
    console.log(
      `[NotificationsState] AddNotification called - ID: ${action.payload.id}, exists: ${exists}, current count: ${state.notifications.length}`
    );
    if (exists) {
      console.log('[NotificationsState] Duplicate notification, skipping');
      return;
    }
    const notifications = [action.payload, ...state.notifications].slice(0, 50);
    ctx.patchState({ notifications });
    console.log('[NotificationsState] Notification added, new count:', notifications.length);
  }

  @Action(MarkAsRead)
  async markAsRead(ctx: StateContext<NotificationsStateModel>, action: MarkAsRead) {
    const state = ctx.getState();
    const notifications = state.notifications.map((n) =>
      n.id === action.payload ? { ...n, read: true } : n
    );
    ctx.patchState({ notifications });
    await this.storageService.markAsRead(action.payload);
  }

  @Action(MarkAllAsRead)
  async markAllAsRead(ctx: StateContext<NotificationsStateModel>) {
    const state = ctx.getState();
    const notifications = state.notifications.map((n) => ({ ...n, read: true }));
    ctx.patchState({ notifications });
    await this.storageService.markAllAsRead();
  }

  @Action(RemoveNotification)
  async removeNotification(ctx: StateContext<NotificationsStateModel>, action: RemoveNotification) {
    const state = ctx.getState();
    const notifications = state.notifications.filter((n) => n.id !== action.payload);
    ctx.patchState({ notifications });
    await this.storageService.removeNotification(action.payload);
  }

  @Action(ClearAllNotifications)
  async clearAll(ctx: StateContext<NotificationsStateModel>) {
    ctx.patchState({ notifications: [] });
    await this.storageService.clearAll();
  }

  @Action(SetFcmToken)
  setFcmToken(ctx: StateContext<NotificationsStateModel>, action: SetFcmToken) {
    ctx.patchState({ fcmToken: action.payload });
  }
}
