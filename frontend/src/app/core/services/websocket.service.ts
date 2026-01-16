import { Injectable, inject, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Store } from '@ngxs/store';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { AddNotification } from '../store/notifications/notifications.actions';
import {
  ConnectionState,
  RoutineUpdatedEvent,
  ProgressLoggedEvent,
  NotificationEvent,
} from '../models/websocket.model';
import { PushNotification } from './push-notifications.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);

  private socket: Socket | null = null;
  private readonly _connectionState = signal<ConnectionState>('disconnected');

  readonly connectionState = this._connectionState.asReadonly();
  readonly isConnected = computed(() => this._connectionState() === 'connected');

  private readonly _routineUpdated = new Subject<RoutineUpdatedEvent>();
  private readonly _progressLogged = new Subject<ProgressLoggedEvent>();
  private readonly _notificationNew = new Subject<NotificationEvent>();

  readonly routineUpdated$ = this._routineUpdated.asObservable();
  readonly progressLogged$ = this._progressLogged.asObservable();
  readonly notificationNew$ = this._notificationNew.asObservable();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.storage.getAccessToken();
    if (!token) {
      console.warn('[WebSocket] No access token available, skipping connection');
      return;
    }

    this._connectionState.set('connecting');

    this.socket = io(`${environment.wsUrl}/events`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._connectionState.set('disconnected');
      console.log('[WebSocket] Disconnected');
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this._connectionState.set('connected');
      console.log('[WebSocket] Connected to server');
    });

    this.socket.on('disconnect', (reason: string) => {
      this._connectionState.set('disconnected');
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      this._connectionState.set('error');
      console.error('[WebSocket] Connection error:', error.message);
    });

    this.socket.io.on('reconnect_attempt', (attempt: number) => {
      this._connectionState.set('reconnecting');
      console.log('[WebSocket] Reconnection attempt:', attempt);
    });

    this.socket.io.on('reconnect', () => {
      this._connectionState.set('connected');
      console.log('[WebSocket] Reconnected successfully');
    });

    this.socket.io.on('reconnect_failed', () => {
      this._connectionState.set('error');
      console.error('[WebSocket] Reconnection failed');
    });

    this.socket.on('routine.updated', (data: RoutineUpdatedEvent) => {
      console.log('[WebSocket] routine.updated:', data);
      this._routineUpdated.next(data);
    });

    this.socket.on('progress.logged', (data: ProgressLoggedEvent) => {
      console.log('[WebSocket] progress.logged:', data);
      this._progressLogged.next(data);
    });

    this.socket.on('notification.new', (data: NotificationEvent) => {
      console.log('[WebSocket] notification.new:', data);
      this._notificationNew.next(data);

      const notification: PushNotification = {
        id: data.notificationId || crypto.randomUUID(),
        title: data.title,
        body: data.body,
        timestamp: new Date(data.timestamp),
        read: false,
        data: data.data as Record<string, string> | undefined,
      };
      this.store.dispatch(new AddNotification(notification));
    });
  }
}
