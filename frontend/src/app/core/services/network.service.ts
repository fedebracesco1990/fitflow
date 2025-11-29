import { Injectable, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private readonly _isOnline = signal(navigator.onLine);

  readonly isOnline = this._isOnline.asReadonly();
  readonly isOffline = computed(() => !this._isOnline());
  readonly isOnline$ = toObservable(this._isOnline);

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this._isOnline.set(true);
      console.log('[Network] Connection restored');
    });

    window.addEventListener('offline', () => {
      this._isOnline.set(false);
      console.log('[Network] Connection lost');
    });
  }
}
