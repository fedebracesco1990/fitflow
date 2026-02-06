import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import {
  PushNotificationsService,
  NotificationPermissionStatus,
} from '../../services/push-notifications.service';
import {
  NotificationsApiService,
  AppNotificationDto,
} from '../../services/notifications-api.service';
import { WebSocketService } from '../../services/websocket.service';
import { AuthState } from '../auth/auth.state';
import {
  InitializeNotifications,
  LoadNotifications,
  SetPermissionStatus,
  AddNotification,
  MarkAsRead,
  MarkAllAsRead,
  RemoveNotification,
  ClearAllNotifications,
  SetFcmToken,
} from './notifications.actions';

export interface NotificationsStateModel {
  notifications: AppNotificationDto[];
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
  private readonly notificationsApi = inject(NotificationsApiService);
  private readonly websocket = inject(WebSocketService);
  private readonly store = inject(Store);
  private wsSubscribed = false;

  @Selector()
  static notifications(state: NotificationsStateModel): AppNotificationDto[] {
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
      return;
    }

    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    const isAuthInitialized = this.store.selectSnapshot(AuthState.isInitialized);

    if (!isAuthenticated || !isAuthInitialized) {
      return;
    }

    ctx.patchState({ isInitialized: true });

    // Always load notifications from backend API (independent of FCM)
    await firstValueFrom(ctx.dispatch(new LoadNotifications()));

    // Subscribe to WebSocket for real-time in-app notifications
    this.subscribeToWebSocket(ctx);

    // FCM is optional — only set up if user has explicitly enabled push
    await this.setupFcmIfEnabled(ctx);
  }

  @Action(LoadNotifications)
  async loadNotifications(ctx: StateContext<NotificationsStateModel>) {
    try {
      const response = await firstValueFrom(this.notificationsApi.getMyNotifications());
      ctx.patchState({ notifications: response.notifications });
    } catch (error) {
      console.error('[NotificationsState] Failed to load notifications from API:', error);
    }
  }

  private subscribeToWebSocket(ctx: StateContext<NotificationsStateModel>): void {
    if (this.wsSubscribed) return;
    this.wsSubscribed = true;

    this.websocket.notificationNew$.subscribe((event) => {
      const notification: AppNotificationDto = {
        id: event.notificationId || '',
        title: event.title,
        body: event.body,
        type: event.type || null,
        targetType: 'user',
        createdAt:
          event.timestamp instanceof Date ? event.timestamp.toISOString() : String(event.timestamp),
        read: false,
      };
      ctx.dispatch(new AddNotification(notification));
    });
  }

  private async setupFcmIfEnabled(ctx: StateContext<NotificationsStateModel>): Promise<void> {
    await this.pushService.initialize();

    const permissionStatus = this.pushService.getPermissionStatus();
    ctx.patchState({ permissionStatus });

    const user = this.store.selectSnapshot(AuthState.user);
    const userId = user?.userId;
    const userPreference = userId
      ? localStorage.getItem(`notification_preference_${userId}`)
      : null;

    if (permissionStatus === 'granted' && userPreference === 'enabled') {
      const token = await this.pushService.getAndRegisterToken();
      if (token) {
        ctx.patchState({ fcmToken: token });
      }
    }
  }

  @Action(SetPermissionStatus)
  setPermissionStatus(ctx: StateContext<NotificationsStateModel>, action: SetPermissionStatus) {
    ctx.patchState({ permissionStatus: action.payload });
  }

  @Action(AddNotification)
  addNotification(ctx: StateContext<NotificationsStateModel>, action: AddNotification) {
    const state = ctx.getState();
    const exists = state.notifications.some((n) => n.id === action.payload.id);
    if (exists) {
      return;
    }
    const notifications = [action.payload, ...state.notifications].slice(0, 50);
    ctx.patchState({ notifications });
  }

  @Action(MarkAsRead)
  async markAsRead(ctx: StateContext<NotificationsStateModel>, action: MarkAsRead) {
    const state = ctx.getState();
    const notifications = state.notifications.map((n) =>
      n.id === action.payload ? { ...n, read: true } : n
    );
    ctx.patchState({ notifications });

    try {
      await firstValueFrom(this.notificationsApi.markAsRead(action.payload));
    } catch (error) {
      console.error('[NotificationsState] Failed to mark as read on server:', error);
    }
  }

  @Action(MarkAllAsRead)
  async markAllAsRead(ctx: StateContext<NotificationsStateModel>) {
    const state = ctx.getState();
    const notifications = state.notifications.map((n) => ({ ...n, read: true }));
    ctx.patchState({ notifications });

    try {
      await firstValueFrom(this.notificationsApi.markAllAsRead());
    } catch (error) {
      console.error('[NotificationsState] Failed to mark all as read on server:', error);
    }
  }

  @Action(RemoveNotification)
  removeNotification(ctx: StateContext<NotificationsStateModel>, action: RemoveNotification) {
    const state = ctx.getState();
    const notifications = state.notifications.filter((n) => n.id !== action.payload);
    ctx.patchState({ notifications });
  }

  @Action(ClearAllNotifications)
  clearAll(ctx: StateContext<NotificationsStateModel>) {
    ctx.patchState({ notifications: [] });
  }

  @Action(SetFcmToken)
  setFcmToken(ctx: StateContext<NotificationsStateModel>, action: SetFcmToken) {
    ctx.patchState({ fcmToken: action.payload });
  }
}
