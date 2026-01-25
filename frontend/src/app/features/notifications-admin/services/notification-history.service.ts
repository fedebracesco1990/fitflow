import { Injectable, signal } from '@angular/core';
import { NotificationHistoryItem, NotificationTargetType } from '../models';

const STORAGE_KEY = 'fitflow_notification_history';
const MAX_HISTORY_ITEMS = 10;

@Injectable({
  providedIn: 'root',
})
export class NotificationHistoryService {
  private readonly _history = signal<NotificationHistoryItem[]>([]);
  readonly history = this._history.asReadonly();

  constructor() {
    this.loadFromStorage();
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
    const item: NotificationHistoryItem = {
      id: crypto.randomUUID(),
      title,
      body,
      targetType,
      recipientCount,
      recipientNames: recipientNames?.slice(0, 5),
      sentAt: new Date().toISOString(),
      success,
      devicesSent,
    };

    const current = this._history();
    const updated = [item, ...current].slice(0, MAX_HISTORY_ITEMS);
    this._history.set(updated);
    this.saveToStorage(updated);
  }

  clearHistory(): void {
    this._history.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as NotificationHistoryItem[];
        this._history.set(items);
      }
    } catch {
      this._history.set([]);
    }
  }

  private saveToStorage(items: NotificationHistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  }
}
