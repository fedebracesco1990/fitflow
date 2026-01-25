export enum NotificationTargetType {
  BROADCAST = 'broadcast',
  SELECTED = 'selected',
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  targetType: NotificationTargetType;
  recipientCount: number;
  recipientNames?: string[];
  sentAt: string;
  success: boolean;
  devicesSent: number;
}

export const TARGET_TYPE_LABELS: Record<NotificationTargetType, string> = {
  [NotificationTargetType.BROADCAST]: 'Todos',
  [NotificationTargetType.SELECTED]: 'Seleccionados',
};
