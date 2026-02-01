import { Injectable } from '@angular/core';
import { PushNotification } from './push-notifications.service';

const DB_NAME = 'fitflow-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationStorageService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[NotificationStorage] Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[NotificationStorage] Database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('[NotificationStorage] Object store created');
        }
      };
    });
  }

  async saveNotification(notification: PushNotification): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const notificationToStore = {
        ...notification,
        timestamp:
          notification.timestamp instanceof Date
            ? notification.timestamp.toISOString()
            : notification.timestamp,
      };

      const request = store.put(notificationToStore);

      request.onerror = () => {
        console.error('[NotificationStorage] Failed to save notification');
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('[NotificationStorage] Notification saved:', notification.id);
        resolve();
      };
    });
  }

  async getAllNotifications(): Promise<PushNotification[]> {
    await this.initialize();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const notifications: PushNotification[] = [];

      request.onerror = () => {
        console.error('[NotificationStorage] Failed to get notifications');
        reject(request.error);
      };

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const notification = cursor.value;
          notifications.push({
            ...notification,
            timestamp: new Date(notification.timestamp),
          });
          cursor.continue();
        } else {
          resolve(notifications.slice(0, 50));
        }
      };
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const notification = getRequest.result;
        if (notification) {
          notification.read = true;
          store.put(notification);
        }
        resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async markAllAsRead(): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    const notifications = await this.getAllNotifications();
    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    for (const notification of notifications) {
      notification.read = true;
      store.put({
        ...notification,
        timestamp:
          notification.timestamp instanceof Date
            ? notification.timestamp.toISOString()
            : notification.timestamp,
      });
    }
  }

  async removeNotification(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    await this.initialize();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
