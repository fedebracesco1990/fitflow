import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { AuthenticatedUser, Role } from '../../models';
import {
  Login,
  LoginSuccess,
  LoginFailure,
  Register,
  RegisterSuccess,
  RegisterFailure,
  CheckSession,
  CheckSessionSuccess,
  CheckSessionFailure,
  RefreshToken,
  RefreshTokenSuccess,
  RefreshTokenFailure,
  Logout,
  LogoutSuccess,
  ClearAuthError,
  SetAuthLoading,
} from './auth.actions';

export interface AuthStateModel {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const defaults: AuthStateModel = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

@State<AuthStateModel>({
  name: 'auth',
  defaults,
})
@Injectable()
export class AuthState {
  private readonly authService = inject(AuthService);
  private readonly storage = inject(StorageService);

  // Selectors
  @Selector()
  static user(state: AuthStateModel): AuthenticatedUser | null {
    return state.user;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static isLoading(state: AuthStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static isInitialized(state: AuthStateModel): boolean {
    return state.isInitialized;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Selector()
  static userRole(state: AuthStateModel): Role | null {
    return state.user?.role ?? null;
  }

  @Selector()
  static isAdmin(state: AuthStateModel): boolean {
    return state.user?.role === Role.ADMIN;
  }

  @Selector()
  static isTrainer(state: AuthStateModel): boolean {
    return state.user?.role === Role.TRAINER;
  }

  // Actions
  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ isLoading: true, error: null });

    return this.authService.login(action.payload).pipe(
      tap((tokens) => {
        this.storage.setTokens(tokens.accessToken, tokens.refreshToken);
        ctx.dispatch(new CheckSession());
      }),
      catchError((error) => {
        ctx.dispatch(new LoginFailure({ error: this.extractErrorMessage(error) }));
        return of(null);
      })
    );
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, action: LoginSuccess) {
    ctx.patchState({
      user: action.payload.user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  }

  @Action(LoginFailure)
  loginFailure(ctx: StateContext<AuthStateModel>, action: LoginFailure) {
    ctx.patchState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: action.payload.error,
    });
  }

  @Action(Register)
  register(ctx: StateContext<AuthStateModel>, action: Register) {
    ctx.patchState({ isLoading: true, error: null });

    return this.authService.register(action.payload).pipe(
      tap((tokens) => {
        this.storage.setTokens(tokens.accessToken, tokens.refreshToken);
        ctx.dispatch(new CheckSession());
      }),
      catchError((error) => {
        ctx.dispatch(new RegisterFailure({ error: this.extractErrorMessage(error) }));
        return of(null);
      })
    );
  }

  @Action(RegisterSuccess)
  registerSuccess(ctx: StateContext<AuthStateModel>, action: RegisterSuccess) {
    ctx.patchState({
      user: action.payload.user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  }

  @Action(RegisterFailure)
  registerFailure(ctx: StateContext<AuthStateModel>, action: RegisterFailure) {
    ctx.patchState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: action.payload.error,
    });
  }

  @Action(CheckSession)
  checkSession(ctx: StateContext<AuthStateModel>) {
    if (!this.storage.hasTokens()) {
      ctx.patchState({ isInitialized: true, isAuthenticated: false });
      return of(null);
    }

    ctx.patchState({ isLoading: true });

    return this.authService.checkSession().pipe(
      tap((response) => {
        ctx.dispatch(new CheckSessionSuccess(response.user));
      }),
      catchError(() => {
        ctx.dispatch(new CheckSessionFailure());
        return of(null);
      })
    );
  }

  @Action(CheckSessionSuccess)
  checkSessionSuccess(ctx: StateContext<AuthStateModel>, action: CheckSessionSuccess) {
    ctx.patchState({
      user: action.payload,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  }

  @Action(CheckSessionFailure)
  checkSessionFailure(ctx: StateContext<AuthStateModel>) {
    this.storage.clearTokens();
    ctx.patchState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  }

  @Action(RefreshToken)
  refreshToken(ctx: StateContext<AuthStateModel>) {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      ctx.dispatch(new RefreshTokenFailure());
      return of(null);
    }

    return this.authService.refreshToken(refreshToken).pipe(
      tap((tokens) => {
        ctx.dispatch(new RefreshTokenSuccess(tokens));
      }),
      catchError(() => {
        ctx.dispatch(new RefreshTokenFailure());
        return of(null);
      })
    );
  }

  @Action(RefreshTokenSuccess)
  refreshTokenSuccess(ctx: StateContext<AuthStateModel>, action: RefreshTokenSuccess) {
    this.storage.setTokens(action.payload.accessToken, action.payload.refreshToken);
  }

  @Action(RefreshTokenFailure)
  refreshTokenFailure(ctx: StateContext<AuthStateModel>) {
    this.storage.clearTokens();
    ctx.patchState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      error: null,
    });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    return this.authService.logout().pipe(
      tap(() => ctx.dispatch(new LogoutSuccess())),
      catchError(() => {
        ctx.dispatch(new LogoutSuccess());
        return of(null);
      })
    );
  }

  @Action(LogoutSuccess)
  logoutSuccess(ctx: StateContext<AuthStateModel>) {
    this.storage.clearTokens();
    ctx.setState(defaults);
    ctx.patchState({ isInitialized: true });
  }

  @Action(ClearAuthError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }

  @Action(SetAuthLoading)
  setLoading(ctx: StateContext<AuthStateModel>, action: SetAuthLoading) {
    ctx.patchState({ isLoading: action.payload });
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const err = error as { error?: { message?: string | string[] } };
      if (err.error?.message) {
        return Array.isArray(err.error.message) ? err.error.message[0] : err.error.message;
      }
    }
    return 'Ha ocurrido un error inesperado';
  }
}
