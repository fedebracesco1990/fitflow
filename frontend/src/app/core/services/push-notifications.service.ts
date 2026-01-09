import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  private readonly apiService = inject(ApiService);
  private readonly storage = inject(StorageService);
  private messaging: Messaging | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      const app = initializeApp(environment.firebase);
      this.messaging = getMessaging(app);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase Messaging:', error);
    }
  }

  getPermissionStatus(): NotificationPermissionStatus {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }
    return Notification.permission as NotificationPermissionStatus;
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  }

  async getAndRegisterToken(): Promise<string | null> {
    if (!this.messaging) {
      await this.initialize();
    }

    if (!this.messaging) {
      return null;
    }

    try {
      const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (token) {
        await this.registerTokenInBackend(token);
      }

      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  private async registerTokenInBackend(token: string): Promise<void> {
    if (!this.storage.hasTokens()) {
      return;
    }

    // Small delay to ensure auth tokens are fully propagated
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!this.storage.hasTokens()) {
      return;
    }

    try {
      await this.apiService
        .post('notifications/register-token', {
          token,
          platform: 'web',
        })
        .toPromise();
    } catch {
      // Silently handle errors - push notification registration is not critical
    }
  }

  async unregisterToken(token: string): Promise<void> {
    try {
      await this.apiService.delete(`notifications/unregister-token?token=${token}`).toPromise();
    } catch (error) {
      console.error('Failed to unregister token:', error);
    }
  }

  onForegroundMessage(callback: (payload: PushNotification) => void): void {
    if (!this.messaging) {
      return;
    }

    onMessage(this.messaging, (payload) => {
      const notification: PushNotification = {
        id: crypto.randomUUID(),
        title: payload.notification?.title || 'FitFlow',
        body: payload.notification?.body || '',
        timestamp: new Date(),
        read: false,
        data: payload.data as Record<string, string>,
      };
      callback(notification);
    });
  }
}
