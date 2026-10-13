import { Injectable } from '@angular/core';
import { LocalHistoryStore } from '../../../shared/utils/local-history-store';
import { NotificationHistoryItem, NotificationTargetType } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationHistoryService extends LocalHistoryStore<NotificationHistoryItem> {
  constructor() {
    super('fitflow_notification_history');
  }

  addToHistory(
    title: string,
    body: string,
    targetType: NotificationTargetType,
    recipientCount: number,
    success: boolean,
    devicesSent: number,
    recipientNames?: string[]
  ): void {
    this.push({
      id: crypto.randomUUID(),
      title,
      body,
      targetType,
      recipientCount,
      recipientNames: recipientNames?.slice(0, 5),
      sentAt: new Date().toISOString(),
      success,
      devicesSent,
    });
  }
}
