import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  PushNotificationsService,
  PushNotification,
  NotificationPermissionStatus,
} from '../../services/push-notifications.service';
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
  private readonly store = inject(Store);

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
      return;
    }

    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    const isAuthInitialized = this.store.selectSnapshot(AuthState.isInitialized);

    if (!isAuthenticated || !isAuthInitialized) {
      return;
    }

    await this.pushService.initialize();

    const permissionStatus = this.pushService.getPermissionStatus();
    ctx.patchState({ permissionStatus, isInitialized: true });

    if (permissionStatus === 'granted') {
      const token = await this.pushService.getAndRegisterToken();
      if (token) {
        ctx.patchState({ fcmToken: token });
      }
    }

    this.pushService.onForegroundMessage((notification) => {
      ctx.dispatch(new AddNotification(notification));
    });
  }

  @Action(SetPermissionStatus)
  setPermissionStatus(ctx: StateContext<NotificationsStateModel>, action: SetPermissionStatus) {
    ctx.patchState({ permissionStatus: action.payload });
  }

  @Action(AddNotification)
  addNotification(ctx: StateContext<NotificationsStateModel>, action: AddNotification) {
    const state = ctx.getState();
    const notifications = [action.payload, ...state.notifications].slice(0, 50);
    ctx.patchState({ notifications });
  }

  @Action(MarkAsRead)
  markAsRead(ctx: StateContext<NotificationsStateModel>, action: MarkAsRead) {
    const state = ctx.getState();
    const notifications = state.notifications.map((n) =>
      n.id === action.payload ? { ...n, read: true } : n
    );
    ctx.patchState({ notifications });
  }

  @Action(MarkAllAsRead)
  markAllAsRead(ctx: StateContext<NotificationsStateModel>) {
    const state = ctx.getState();
    const notifications = state.notifications.map((n) => ({ ...n, read: true }));
    ctx.patchState({ notifications });
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
