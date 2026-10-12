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
import { RefreshTokenFailure, RefreshTokenSuccess } from '../store/auth/auth.actions';

// Resultado del refresh en curso. Las peticiones que llegan con 401 mientras se refresca
// esperan acá: reintentan si sale bien y reciben el error si falla (no quedan colgadas).
type RefreshState =
  | { status: 'pending' }
  | { status: 'success'; token: string }
  | { status: 'failed'; error: unknown };

let isRefreshing = false;
const refreshState = new BehaviorSubject<RefreshState>({ status: 'pending' });

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const storage = inject(StorageService);
  const authService = inject(AuthService);
  const store = inject(Store);

  const publicEndpoints = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/refresh',
  ];
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
        const retry = (accessToken: string) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));

        if (!isRefreshing) {
          isRefreshing = true;
          refreshState.next({ status: 'pending' });
          const refreshToken = storage.getRefreshToken();

          if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
              // Solo los errores del refresh cierran la sesión; los del reintento se propagan tal cual
              catchError((refreshError) => {
                isRefreshing = false;
                refreshState.next({ status: 'failed', error: refreshError });
                store.dispatch(new RefreshTokenFailure());
                return throwError(() => refreshError);
              }),
              switchMap((tokens) => {
                isRefreshing = false;
                // Despachar RefreshTokenSuccess para sincronizar con AuthState
                // Esto guarda los tokens Y reinicia el timer de refresh proactivo
                store.dispatch(new RefreshTokenSuccess(tokens));
                refreshState.next({ status: 'success', token: tokens.accessToken });
                return retry(tokens.accessToken);
              })
            );
          } else {
            isRefreshing = false;
            refreshState.next({ status: 'failed', error });
            store.dispatch(new RefreshTokenFailure());
            return throwError(() => error);
          }
        } else {
          return refreshState.pipe(
            filter((state) => state.status !== 'pending'),
            take(1),
            switchMap((state) =>
              state.status === 'success' ? retry(state.token) : throwError(() => error)
            )
          );
        }
      }

      return throwError(() => error);
    })
  );
};
