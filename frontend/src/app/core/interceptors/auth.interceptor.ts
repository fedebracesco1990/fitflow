import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, filter, take, BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';
import { RefreshTokenFailure } from '../store/auth/auth.actions';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const store = inject(Store);

  const publicEndpoints = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicEndpoint = publicEndpoints.some((endpoint) => req.url.includes(endpoint));

  if (isPublicEndpoint) {
    return next(req);
  }

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
      if (error.status === 401 && !isPublicEndpoint && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);
          const refreshToken = storage.getRefreshToken();

          if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
              switchMap((tokens) => {
                isRefreshing = false;
                storage.setTokens(tokens.accessToken, tokens.refreshToken);
                refreshTokenSubject.next(tokens.accessToken);

                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${tokens.accessToken}`,
                  },
                });
                return next(retryReq);
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                refreshTokenSubject.next(null);
                store.dispatch(new RefreshTokenFailure());
                return throwError(() => refreshError);
              })
            );
          } else {
            isRefreshing = false;
            store.dispatch(new RefreshTokenFailure());
            return throwError(() => error);
          }
        } else {
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return next(retryReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
