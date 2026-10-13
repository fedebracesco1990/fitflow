import { Injectable, inject, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import {
  ConnectionState,
  RoutineUpdatedEvent,
  ProgressLoggedEvent,
  NotificationEvent,
  AccessRegisteredEvent,
} from '../models/websocket.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly storage = inject(StorageService);

  private socket: Socket | null = null;
  private readonly _connectionState = signal<ConnectionState>('disconnected');

  readonly connectionState = this._connectionState.asReadonly();
  readonly isConnected = computed(() => this._connectionState() === 'connected');

  private readonly _routineUpdated = new Subject<RoutineUpdatedEvent>();
  private readonly _progressLogged = new Subject<ProgressLoggedEvent>();
  private readonly _notificationNew = new Subject<NotificationEvent>();
  private readonly _accessRegistered = new Subject<AccessRegisteredEvent>();

  readonly routineUpdated$ = this._routineUpdated.asObservable();
  readonly progressLogged$ = this._progressLogged.asObservable();
  readonly notificationNew$ = this._notificationNew.asObservable();
  readonly accessRegistered$ = this._accessRegistered.asObservable();

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
      // A function, not an object: socket.io calls it on every (re)connection, so it uses the current token
      // and not the one from connection time (which may have expired and been renewed).
      auth: (cb) => cb({ token: this.storage.getAccessToken() }),
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
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this._connectionState.set('connected');
    });

    this.socket.on('disconnect', () => {
      this._connectionState.set('disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      this._connectionState.set('error');
      console.error('[WebSocket] Connection error:', error.message);
    });

    this.socket.io.on('reconnect_attempt', () => {
      this._connectionState.set('reconnecting');
    });

    this.socket.io.on('reconnect', () => {
      this._connectionState.set('connected');
    });

    this.socket.io.on('reconnect_failed', () => {
      this._connectionState.set('error');
      console.error('[WebSocket] Reconnection failed');
    });

    this.socket.on('routine.updated', (data: RoutineUpdatedEvent) => {
      this._routineUpdated.next(data);
    });

    this.socket.on('progress.logged', (data: ProgressLoggedEvent) => {
      this._progressLogged.next(data);
    });

    this.socket.on('notification.new', (data: NotificationEvent) => {
      this._notificationNew.next(data);
    });

    this.socket.on('access.registered', (data: AccessRegisteredEvent) => {
      this._accessRegistered.next(data);
    });
  }
}
