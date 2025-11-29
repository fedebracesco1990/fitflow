import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../models';
import {
  LoadProfile,
  LoadProfileSuccess,
  LoadProfileFailure,
  UpdateProfile,
  UpdateProfileSuccess,
  UpdateProfileFailure,
  ChangePassword,
  ChangePasswordSuccess,
  ChangePasswordFailure,
  ClearUserError,
  ClearUserSuccess,
  ResetUserState,
} from './user.actions';

export interface UserStateModel {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const defaults: UserStateModel = {
  profile: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

@State<UserStateModel>({
  name: 'user',
  defaults,
})
@Injectable()
export class UserState {
  private readonly userService = inject(UserService);

  // Selectors
  @Selector()
  static profile(state: UserStateModel): User | null {
    return state.profile;
  }

  @Selector()
  static isLoading(state: UserStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static error(state: UserStateModel): string | null {
    return state.error;
  }

  @Selector()
  static successMessage(state: UserStateModel): string | null {
    return state.successMessage;
  }

  // Actions
  @Action(LoadProfile)
  loadProfile(ctx: StateContext<UserStateModel>) {
    ctx.patchState({ isLoading: true, error: null });

    return this.userService.getMyProfile().pipe(
      tap((profile) => ctx.dispatch(new LoadProfileSuccess(profile))),
      catchError((error) => {
        ctx.dispatch(new LoadProfileFailure({ error: this.extractErrorMessage(error) }));
        return of(null);
      })
    );
  }

  @Action(LoadProfileSuccess)
  loadProfileSuccess(ctx: StateContext<UserStateModel>, action: LoadProfileSuccess) {
    ctx.patchState({
      profile: action.payload,
      isLoading: false,
      error: null,
    });
  }

  @Action(LoadProfileFailure)
  loadProfileFailure(ctx: StateContext<UserStateModel>, action: LoadProfileFailure) {
    ctx.patchState({
      isLoading: false,
      error: action.payload.error,
    });
  }

  @Action(UpdateProfile)
  updateProfile(ctx: StateContext<UserStateModel>, action: UpdateProfile) {
    ctx.patchState({ isLoading: true, error: null, successMessage: null });

    return this.userService.updateMyProfile(action.payload).pipe(
      tap((profile) => ctx.dispatch(new UpdateProfileSuccess(profile))),
      catchError((error) => {
        ctx.dispatch(new UpdateProfileFailure({ error: this.extractErrorMessage(error) }));
        return of(null);
      })
    );
  }

  @Action(UpdateProfileSuccess)
  updateProfileSuccess(ctx: StateContext<UserStateModel>, action: UpdateProfileSuccess) {
    ctx.patchState({
      profile: action.payload,
      isLoading: false,
      error: null,
      successMessage: 'Perfil actualizado correctamente',
    });
  }

  @Action(UpdateProfileFailure)
  updateProfileFailure(ctx: StateContext<UserStateModel>, action: UpdateProfileFailure) {
    ctx.patchState({
      isLoading: false,
      error: action.payload.error,
      successMessage: null,
    });
  }

  @Action(ChangePassword)
  changePassword(ctx: StateContext<UserStateModel>, action: ChangePassword) {
    ctx.patchState({ isLoading: true, error: null, successMessage: null });

    return this.userService.changeMyPassword(action.payload).pipe(
      tap(() => ctx.dispatch(new ChangePasswordSuccess())),
      catchError((error) => {
        ctx.dispatch(new ChangePasswordFailure({ error: this.extractErrorMessage(error) }));
        return of(null);
      })
    );
  }

  @Action(ChangePasswordSuccess)
  changePasswordSuccess(ctx: StateContext<UserStateModel>) {
    ctx.patchState({
      isLoading: false,
      error: null,
      successMessage: 'Contraseña actualizada correctamente',
    });
  }

  @Action(ChangePasswordFailure)
  changePasswordFailure(ctx: StateContext<UserStateModel>, action: ChangePasswordFailure) {
    ctx.patchState({
      isLoading: false,
      error: action.payload.error,
      successMessage: null,
    });
  }

  @Action(ClearUserError)
  clearError(ctx: StateContext<UserStateModel>) {
    ctx.patchState({ error: null });
  }

  @Action(ClearUserSuccess)
  clearSuccess(ctx: StateContext<UserStateModel>) {
    ctx.patchState({ successMessage: null });
  }

  @Action(ResetUserState)
  resetState(ctx: StateContext<UserStateModel>) {
    ctx.setState(defaults);
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
