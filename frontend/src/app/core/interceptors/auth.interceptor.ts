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
import { environment } from '../../../environments/environment';

// In-flight refresh result. Requests that get a 401 while a refresh is in progress
// wait here: they retry if it succeeds and receive the error if it fails (they don't hang).
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

  // Exact match: with `includes`, any URL containing '/login' was sent without a token.
  // 'auth/register' is excluded: in the backend it's ADMIN-only and requires the token.
  const publicEndpoints = [
    'auth/login',
    'auth/refresh',
    'auth/forgot-password',
    'auth/reset-password',
  ];
  const path = req.url.split('?')[0];
  const isPublicEndpoint = publicEndpoints.some(
    (endpoint) => path === `${environment.apiUrl}/${endpoint}`
  );

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
      if (error.status === 401) {
        const retry = (accessToken: string) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }));

        if (!isRefreshing) {
          isRefreshing = true;
          refreshState.next({ status: 'pending' });
          const refreshToken = storage.getRefreshToken();

          if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
              // Only refresh errors end the session; retry errors are propagated as-is
              catchError((refreshError) => {
                isRefreshing = false;
                refreshState.next({ status: 'failed', error: refreshError });
                store.dispatch(new RefreshTokenFailure());
                return throwError(() => refreshError);
              }),
              switchMap((tokens) => {
                isRefreshing = false;
                // Dispatch RefreshTokenSuccess to sync with AuthState
                // This stores the tokens AND restarts the proactive refresh timer
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
