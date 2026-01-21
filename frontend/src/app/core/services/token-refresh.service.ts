import { Injectable, inject, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { jwtDecode } from 'jwt-decode';
import { RefreshToken } from '../store/auth/auth.actions';

interface JwtPayload {
  exp: number;
  sub: string;
  email: string;
  role: string;
  type: string;
}

/**
 * Service that manages proactive token refresh using a timer.
 * Automatically refreshes the access token before it expires to maintain
 * a seamless user experience without unexpected logouts.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService implements OnDestroy {
  private readonly store = inject(Store);
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  /** Time buffer before token expiration to trigger refresh (5 minutes) */
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000;

  ngOnDestroy(): void {
    this.stopRefreshTimer();
  }

  /**
   * Starts a timer to automatically refresh the access token before it expires.
   * The timer is set to trigger 5 minutes before the token's expiration time.
   * If the token is already expired or about to expire, triggers an immediate refresh.
   *
   * @param accessToken - The JWT access token to decode and schedule refresh for
   */
  startRefreshTimer(accessToken: string): void {
    this.stopRefreshTimer();

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const expirationTime = decoded.exp * 1000;
      const refreshTime = expirationTime - this.REFRESH_BUFFER_MS;
      const delay = refreshTime - Date.now();

      if (delay > 0) {
        this.refreshTimer = setTimeout(() => {
          this.store.dispatch(new RefreshToken());
        }, delay);
      } else {
        this.store.dispatch(new RefreshToken());
      }
    } catch {
      // Token decode failed - likely invalid token, skip timer setup
    }
  }

  /**
   * Stops the current refresh timer if one is active.
   * Should be called on logout or when the user session ends.
   */
  stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
