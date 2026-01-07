import { PushNotification } from '../../services/push-notifications.service';

export class InitializeNotifications {
  static readonly type = '[Notifications] Initialize';
}

export class SetPermissionStatus {
  static readonly type = '[Notifications] Set Permission Status';
  constructor(public payload: 'default' | 'granted' | 'denied') {}
}

export class AddNotification {
  static readonly type = '[Notifications] Add';
  constructor(public payload: PushNotification) {}
}

export class MarkAsRead {
  static readonly type = '[Notifications] Mark As Read';
  constructor(public payload: string) {}
}

export class MarkAllAsRead {
  static readonly type = '[Notifications] Mark All As Read';
}

export class RemoveNotification {
  static readonly type = '[Notifications] Remove';
  constructor(public payload: string) {}
}

export class ClearAllNotifications {
  static readonly type = '[Notifications] Clear All';
}

export class SetFcmToken {
  static readonly type = '[Notifications] Set FCM Token';
  constructor(public payload: string | null) {}
}
