import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

export interface PushNotificationSupport {
  isSupported: boolean;
  isIOS: boolean;
  isPWA: boolean;
  requiresPWA: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  private readonly http = inject(HttpClient);
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

  checkSupport(): PushNotificationSupport {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

    if (isIOS && !isPWA) {
      return {
        isSupported: false,
        isIOS: true,
        isPWA: false,
        requiresPWA: true,
        message:
          'Para recibir notificaciones en iPhone, primero instala la app: Safari → Compartir → Añadir a pantalla de inicio',
      };
    }

    if (!isSupported) {
      return {
        isSupported: false,
        isIOS,
        isPWA,
        requiresPWA: false,
        message: 'Tu navegador no soporta notificaciones push',
      };
    }

    return {
      isSupported: true,
      isIOS,
      isPWA,
      requiresPWA: false,
    };
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
    // Verify JWT is available before attempting to register
    const accessToken = this.storage.getAccessToken();
    if (!accessToken) {
      return;
    }

    try {
      // Use HttpClient directly with explicit Authorization header
      // This bypasses potential interceptor timing issues
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      });

      await firstValueFrom(
        this.http.post(
          `${environment.apiUrl}/notifications/register-token`,
          { token, platform: 'web' },
          { headers }
        )
      );
      console.log('[PushNotifications] FCM token registered in backend successfully');
    } catch (error: unknown) {
      // Silent handling for 401 - will retry on next page refresh
      const httpError = error as { status?: number };
      if (httpError?.status === 401) {
        return;
      }
      console.error('[PushNotifications] Failed to register FCM token in backend:', error);
    }
  }

  async unregisterToken(token: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.delete(`notifications/unregister-token?token=${token}`));
    } catch (error) {
      console.error('Failed to unregister token:', error);
    }
  }
}
