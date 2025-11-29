import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Store } from '@ngxs/store';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { RefreshTokenFailure } from '../store/auth/auth.actions';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const store = inject(Store);

  // Skip auth header for public endpoints
  const publicEndpoints = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicEndpoint = publicEndpoints.some((endpoint) => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    return next(req);
  }

  // Add token to request
  const token = storage.getAccessToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors - try to refresh token
      if (error.status === 401 && !isPublicEndpoint && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = storage.getRefreshToken();

          if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
              switchMap((tokens) => {
                isRefreshing = false;
                storage.setTokens(tokens.accessToken, tokens.refreshToken);

                // Retry the original request with new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                });
                return next(retryReq);
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                store.dispatch(new RefreshTokenFailure());
                return throwError(() => refreshError);
              })
            );
          }
        }

        store.dispatch(new RefreshTokenFailure());
      }

      return throwError(() => error);
    })
  );
};
